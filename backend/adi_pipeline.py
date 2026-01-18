# import pandas as pd
# import numpy as np
# import glob
# import os
# import json
# from datetime import datetime

# # ================= CONFIG =================
# W1, W2, W3, W4 = 0.25, 0.25, 0.25, 0.25

# DATA_DIR = r"C:\Users\ADMIN\OneDrive\Desktop\aadhar\data"
# OUTPUT_DIR = "output"
# JSON_DIR = os.path.join(OUTPUT_DIR, "json")

# os.makedirs(OUTPUT_DIR, exist_ok=True)
# os.makedirs(JSON_DIR, exist_ok=True)
# # ==========================================

# def load_and_merge_data():
#     enrol_files = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_enrolment_*.csv"))
#     demo_files  = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_demographic_*.csv"))
#     bio_files   = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_biometric_*.csv"))

#     enrol_df = pd.concat((pd.read_csv(f) for f in enrol_files), ignore_index=True) if enrol_files else pd.DataFrame()
#     demo_df  = pd.concat((pd.read_csv(f) for f in demo_files), ignore_index=True) if demo_files else pd.DataFrame()
#     bio_df   = pd.concat((pd.read_csv(f) for f in bio_files), ignore_index=True) if bio_files else pd.DataFrame()

#     return enrol_df, demo_df, bio_df

# def process_data():
#     enrol_df, demo_df, bio_df = load_and_merge_data()

#     for df in [enrol_df, demo_df, bio_df]:
#         if not df.empty:
#             df['date'] = pd.to_datetime(df['date'], errors='coerce')
#             df['pincode'] = df['pincode'].astype(str).str.replace(r'\.0$', '', regex=True)

#     # ----- Enrolment -----
#     if not enrol_df.empty:
#         enrol_agg = enrol_df.groupby(
#             ['state','district','pincode', pd.Grouper(key='date', freq='M')]
#         ).sum(numeric_only=True).reset_index()

#         enrol_agg['total_enrolment'] = (
#             enrol_agg.get('age_0_5', 0) +
#             enrol_agg.get('age_5_17', 0) +
#             enrol_agg.get('age_18_greater', 0)
#         )

#         enrol_agg['child_ratio'] = (
#             (enrol_agg.get('age_0_5', 0) + enrol_agg.get('age_5_17', 0)) /
#             enrol_agg['total_enrolment'].replace(0, 1)
#         )
#     else:
#         enrol_agg = pd.DataFrame(columns=['state','district','pincode','date','total_enrolment','child_ratio'])

#     # ----- Demographic -----
#     if not demo_df.empty:
#         if 'demo_age_5_17' in demo_df.columns and 'demo_age_17_' in demo_df.columns:
#             demo_df['demo_total'] = demo_df['demo_age_5_17'] + demo_df['demo_age_17_']
#         else:
#             demo_df['demo_total'] = 0

#         demo_agg = demo_df.groupby(
#             ['state','district','pincode', pd.Grouper(key='date', freq='M')]
#         )['demo_total'].sum().reset_index(name='demo_updates')
#     else:
#         demo_agg = pd.DataFrame(columns=['state','district','pincode','date','demo_updates'])

#     # ----- Biometric -----
#     if not bio_df.empty:
#         if 'bio_age_5_17' in bio_df.columns and 'bio_age_17_' in bio_df.columns:
#             bio_df['bio_total'] = bio_df['bio_age_5_17'] + bio_df['bio_age_17_']
#         else:
#             bio_df['bio_total'] = 0

#         bio_agg = bio_df.groupby(
#             ['state','district','pincode', pd.Grouper(key='date', freq='M')]
#         )['bio_total'].sum().reset_index(name='bio_updates')
#     else:
#         bio_agg = pd.DataFrame(columns=['state','district','pincode','date','bio_updates'])

#     # ----- Merge -----
#     master_df = enrol_agg.merge(demo_agg, how='outer', on=['state','district','pincode','date']).fillna(0)
#     master_df = master_df.merge(bio_agg, how='outer', on=['state','district','pincode','date']).fillna(0)

#     grouped = master_df.groupby(['state','district','pincode'])

#     master_df['enrolment_dev'] = (
#         (master_df['total_enrolment'] - grouped['total_enrolment'].transform('mean')) /
#         grouped['total_enrolment'].transform('std').replace(0,1)
#     )

#     master_df['demographic_dev'] = (
#         (master_df['demo_updates'] - grouped['demo_updates'].transform('mean')) /
#         grouped['demo_updates'].transform('std').replace(0,1)
#     )

#     master_df['biometric_dev'] = (
#         (master_df['bio_updates'] - grouped['bio_updates'].transform('mean')) /
#         grouped['bio_updates'].transform('std').replace(0,1)
#     )

#     master_df['age_shift'] = (
#         master_df['child_ratio'] - grouped['child_ratio'].transform('mean')
#     ).abs()

#     master_df['adi_score'] = (
#         W1*master_df['enrolment_dev'].abs() +
#         W2*master_df['demographic_dev'].abs() +
#         W3*master_df['biometric_dev'].abs() +
#         W4*master_df['age_shift']
#     )

#     max_adi = master_df['adi_score'].max()
#     if pd.isna(max_adi) or max_adi == 0:
#         max_adi = 1

#     master_df['adi_score_normalized'] = (master_df['adi_score'] / max_adi) * 100

#     master_df.to_csv(os.path.join(OUTPUT_DIR, "adi_scores.csv"), index=False)

#     regions = master_df[['state','district','pincode']].drop_duplicates().to_dict(orient='records')
#     json.dump(regions, open(os.path.join(JSON_DIR,"regions.json"),"w"))

#     latest = master_df.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
#     adi_json = latest[['state','district','pincode','adi_score_normalized','enrolment_dev','demographic_dev','biometric_dev','age_shift']].to_dict(orient='records')
#     json.dump(adi_json, open(os.path.join(JSON_DIR,"adi.json"),"w"))

#     return master_df

# if __name__ == "__main__":
#     print("Running ADI Pipeline...")
#     df = process_data()
#     print("Done:", len(df))
import pandas as pd
import numpy as np
import glob
import os
import json
from datetime import datetime

# ================= CONFIG =================
W1, W2, W3, W4 = 0.25, 0.25, 0.25, 0.25

DATA_DIR = r"data"
OUTPUT_DIR = "output"
JSON_DIR = os.path.join(OUTPUT_DIR, "json")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(JSON_DIR, exist_ok=True)
# ==========================================

def load_and_merge_data():
    enrol_files = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_enrolment_*.csv"))
    demo_files  = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_demographic_*.csv"))
    bio_files   = glob.glob(os.path.join(DATA_DIR, "api_data_aadhar_biometric_*.csv"))

    enrol_df = pd.concat((pd.read_csv(f) for f in enrol_files), ignore_index=True) if enrol_files else pd.DataFrame()
    demo_df  = pd.concat((pd.read_csv(f) for f in demo_files), ignore_index=True) if demo_files else pd.DataFrame()
    bio_df   = pd.concat((pd.read_csv(f) for f in bio_files), ignore_index=True) if bio_files else pd.DataFrame()

    return enrol_df, demo_df, bio_df

def process_data():
    enrol_df, demo_df, bio_df = load_and_merge_data()

    for df in [enrol_df, demo_df, bio_df]:
        if not df.empty:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            df['pincode'] = df['pincode'].astype(str).str.replace(r'\.0$', '', regex=True)

    # ----- Enrolment -----
    if not enrol_df.empty:
        enrol_agg = enrol_df.groupby(
            ['state','district','pincode', pd.Grouper(key='date', freq='M')]
        ).sum(numeric_only=True).reset_index()

        enrol_agg['total_enrolment'] = (
            enrol_agg.get('age_0_5', 0) +
            enrol_agg.get('age_5_17', 0) +
            enrol_agg.get('age_18_greater', 0)
        )

        enrol_agg['child_ratio'] = (
            (enrol_agg.get('age_0_5', 0) + enrol_agg.get('age_5_17', 0)) /
            enrol_agg['total_enrolment'].replace(0, 1)
        )
    else:
        enrol_agg = pd.DataFrame(columns=['state','district','pincode','date','total_enrolment','child_ratio'])

    # ----- Demographic -----
    if not demo_df.empty:
        if 'demo_age_5_17' in demo_df.columns and 'demo_age_17_' in demo_df.columns:
            demo_df['demo_total'] = demo_df['demo_age_5_17'] + demo_df['demo_age_17_']
        else:
            demo_df['demo_total'] = 0

        demo_agg = demo_df.groupby(
            ['state','district','pincode', pd.Grouper(key='date', freq='M')]
        )['demo_total'].sum().reset_index(name='demo_updates')
    else:
        demo_agg = pd.DataFrame(columns=['state','district','pincode','date','demo_updates'])

    # ----- Biometric -----
    if not bio_df.empty:
        if 'bio_age_5_17' in bio_df.columns and 'bio_age_17_' in bio_df.columns:
            bio_df['bio_total'] = bio_df['bio_age_5_17'] + bio_df['bio_age_17_']
        else:
            bio_df['bio_total'] = 0

        bio_agg = bio_df.groupby(
            ['state','district','pincode', pd.Grouper(key='date', freq='M')]
        )['bio_total'].sum().reset_index(name='bio_updates')
    else:
        bio_agg = pd.DataFrame(columns=['state','district','pincode','date','bio_updates'])

    # ----- Merge -----
    master_df = enrol_agg.merge(demo_agg, how='outer', on=['state','district','pincode','date']).fillna(0)
    master_df = master_df.merge(bio_agg, how='outer', on=['state','district','pincode','date']).fillna(0)

    grouped = master_df.groupby(['state','district','pincode'])

    master_df['enrolment_dev'] = (
        (master_df['total_enrolment'] - grouped['total_enrolment'].transform('mean')) /
        grouped['total_enrolment'].transform('std').replace(0,1)
    )

    master_df['demographic_dev'] = (
        (master_df['demo_updates'] - grouped['demo_updates'].transform('mean')) /
        grouped['demo_updates'].transform('std').replace(0,1)
    )

    master_df['biometric_dev'] = (
        (master_df['bio_updates'] - grouped['bio_updates'].transform('mean')) /
        grouped['bio_updates'].transform('std').replace(0,1)
    )

    master_df['age_shift'] = (
        master_df['child_ratio'] - grouped['child_ratio'].transform('mean')
    ).abs()

    master_df['adi_score'] = (
        W1*master_df['enrolment_dev'].abs() +
        W2*master_df['demographic_dev'].abs() +
        W3*master_df['biometric_dev'].abs() +
        W4*master_df['age_shift']
    )

    max_adi = master_df['adi_score'].max()
    if pd.isna(max_adi) or max_adi == 0:
        max_adi = 1

    master_df['adi_score_normalized'] = (master_df['adi_score'] / max_adi) * 100

    # -------- FIX: remove NaN and inf --------
    master_df = master_df.replace([np.inf, -np.inf], np.nan)
    master_df = master_df.fillna(0)
    # ----------------------------------------

    master_df.to_csv(os.path.join(OUTPUT_DIR, "adi_scores.csv"), index=False)

    regions = master_df[['state','district','pincode']].drop_duplicates().to_dict(orient='records')
    json.dump(regions, open(os.path.join(JSON_DIR,"regions.json"),"w"))

    latest = master_df.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
    adi_json = latest[['state','district','pincode','adi_score_normalized','enrolment_dev','demographic_dev','biometric_dev','age_shift']].to_dict(orient='records')
    json.dump(adi_json, open(os.path.join(JSON_DIR,"adi.json"),"w"))

    return master_df

if __name__ == "__main__":
    print("Running ADI Pipeline...")
    df = process_data()
    print("Done:", len(df))
