# # from fastapi import FastAPI, Query
# # from fastapi.middleware.cors import CORSMiddleware
# # import pandas as pd
# # import os
# # from typing import Optional
# # from backend.adi_pipeline import process_data, OUTPUT_DIR

# # app = FastAPI()

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # data_cache = None

# # def get_data():
# #     global data_cache
# #     csv_path = os.path.join(OUTPUT_DIR, "adi_scores.csv")

# #     if data_cache is not None:
# #         return data_cache

# #     if os.path.exists(csv_path):
# #         df = pd.read_csv(csv_path)
# #         df['date'] = pd.to_datetime(df['date'], errors='coerce')
# #     else:
# #         df = process_data()

# #     data_cache = df
# #     return df

# # @app.on_event("startup")
# # async def startup():
# #     try:
# #         get_data()
# #     except Exception as e:
# #         print("Startup load failed:", e)

# # # -------- API ROUTES --------

# # @app.get("/api/regions")
# # def regions():
# #     df = get_data()
# #     if df.empty:
# #         return []
# #     return df[['state','district','pincode']].drop_duplicates().to_dict(orient='records')

# # @app.get("/api/adi")
# # def adi(state: Optional[str]=None, district: Optional[str]=None, pincode: Optional[str]=None):
# #     df = get_data()
# #     if df.empty:
# #         return []

# #     mask = pd.Series(True, index=df.index)
# #     if state: mask &= df['state']==state
# #     if district: mask &= df['district']==district
# #     if pincode: mask &= df['pincode']==str(pincode)

# #     filtered = df[mask]
# #     if filtered.empty:
# #         return []

# #     latest = filtered.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
# #     latest['date'] = latest['date'].dt.strftime('%Y-%m-%d')

# #     return latest[
# #         ['state','district','pincode','adi_score_normalized','enrolment_dev','demographic_dev','biometric_dev','age_shift']
# #     ].rename(columns={
# #         'adi_score_normalized':'adiScore',
# #         'enrolment_dev':'enrolmentDev',
# #         'demographic_dev':'demographicDev',
# #         'biometric_dev':'biometricDev',
# #         'age_shift':'ageShift'
# #     }).fillna(0).to_dict(orient='records')

# # @app.get("/api/timeline")
# # def timeline(state: str=None, district: str=None, pincode: str=None):
# #     df = get_data()
# #     if df.empty:
# #         return []

# #     mask = pd.Series(True, index=df.index)
# #     if state: mask &= df['state']==state
# #     if district: mask &= df['district']==district
# #     if pincode: mask &= df['pincode']==str(pincode)

# #     rows = []
# #     for _, r in df[mask].sort_values('date').iterrows():
# #         if pd.isna(r['date']):
# #             continue
# #         d = r['date'].strftime('%Y-%m-%d')
# #         rows.append({"date":d,"value":float(r.get('adi_score_normalized',0)),"metric":"ADI"})
# #         rows.append({"date":d,"value":float(r.get('total_enrolment',0)),"metric":"Enrolment"})
# #         rows.append({"date":d,"value":float(r.get('demo_updates',0)),"metric":"Demographic"})
# #     return rows

# # @app.get("/api/patterns/{ptype}")
# # def patterns(ptype: str):
# #     df = get_data()
# #     if df.empty:
# #         return []

# #     latest = df.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
# #     out = []

# #     if ptype=="instability":
# #         top = latest.nlargest(10,'adi_score_normalized')
# #         for _,r in top.iterrows():
# #             out.append({
# #                 "type":"instability",
# #                 "region":{"state":r['state'],"district":r['district'],"pincode":r['pincode']},
# #                 "confidence":float(r['adi_score_normalized'])/100,
# #                 "description":f"High ADI: {r['adi_score_normalized']:.1f}"
# #             })

# #     if ptype=="migration":
# #         top = latest.nlargest(10,'enrolment_dev')
# #         for _,r in top.iterrows():
# #             out.append({
# #                 "type":"migration",
# #                 "region":{"state":r['state'],"district":r['district'],"pincode":r['pincode']},
# #                 "confidence":min(abs(float(r['enrolment_dev'])),1.0),
# #                 "description":f"High enrolment deviation: {r['enrolment_dev']:.2f}"
# #             })

# #     return out

# # # -------- LEGACY PATH SUPPORT --------
# # # In case old frontend or cache still calls these

# # @app.get("/adi")
# # def legacy_adi():
# #     return adi()

# # @app.get("/regions")
# # def legacy_regions():
# #     return regions()

# # @app.get("/patterns/{ptype}")
# # def legacy_patterns(ptype: str):
# #     return patterns(ptype)

# # @app.get("/timeline")
# # def legacy_timeline(state: str=None, district: str=None, pincode: str=None):
# #     return timeline(state, district, pincode)
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import Optional
from backend.adi_pipeline import process_data, OUTPUT_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_cache = None

def get_data():
    global data_cache
    csv_path = os.path.join(OUTPUT_DIR, "adi_scores.csv")

    if data_cache is not None:
        return data_cache

    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    else:
        df = process_data()

    # --- FIX: clean bad numbers ---
    df = df.replace([float("inf"), float("-inf")], pd.NA).fillna(0)
    # ------------------------------

    data_cache = df
    return df

@app.on_event("startup")
async def startup():
    try:
        get_data()
    except Exception as e:
        print("Startup load failed:", e)

# -------- API ROUTES --------

@app.get("/api/regions")
def regions():
    df = get_data()
    if df.empty:
        return []
    return df[['state','district','pincode']].drop_duplicates().to_dict(orient='records')

@app.get("/api/adi")
def adi(state: Optional[str]=None, district: Optional[str]=None, pincode: Optional[str]=None):
    df = get_data()
    if df.empty:
        return []

    mask = pd.Series(True, index=df.index, dtype=bool)  # FIX dtype
    if state: mask &= df['state']==state
    if district: mask &= df['district']==district
    if pincode: mask &= df['pincode']==str(pincode)

    filtered = df[mask]
    if filtered.empty:
        return []

    latest = filtered.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
    latest['date'] = latest['date'].dt.strftime('%Y-%m-%d')

    return latest[
        ['state','district','pincode','adi_score_normalized','enrolment_dev','demographic_dev','biometric_dev','age_shift']
    ].rename(columns={
        'adi_score_normalized':'adiScore',
        'enrolment_dev':'enrolmentDev',
        'demographic_dev':'demographicDev',
        'biometric_dev':'biometricDev',
        'age_shift':'ageShift'
    }).fillna(0).to_dict(orient='records')

@app.get("/api/timeline")
def timeline(state: str=None, district: str=None, pincode: str=None):
    df = get_data()
    if df.empty:
        return []

    mask = pd.Series(True, index=df.index, dtype=bool)  # FIX dtype
    if state: mask &= df['state']==state
    if district: mask &= df['district']==district
    if pincode: mask &= df['pincode']==str(pincode)

    rows = []
    for _, r in df[mask].sort_values('date').iterrows():
        if pd.isna(r['date']):
            continue
        try:  # --- FIX: prevent JSON crash ---
            d = r['date'].strftime('%Y-%m-%d')
            rows.append({"date":d,"value":float(r.get('adi_score_normalized',0)),"metric":"ADI"})
            rows.append({"date":d,"value":float(r.get('total_enrolment',0)),"metric":"Enrolment"})
            rows.append({"date":d,"value":float(r.get('demo_updates',0)),"metric":"Demographic"})
        except:
            continue
    return rows

@app.get("/api/patterns/{ptype}")
def patterns(ptype: str):
    df = get_data()
    if df.empty:
        return []

    latest = df.sort_values('date').groupby(['state','district','pincode']).last().reset_index()
    out = []

    if ptype=="instability":
        top = latest.nlargest(10,'adi_score_normalized')
        for _,r in top.iterrows():
            out.append({
                "type":"instability",
                "region":{"state":r['state'],"district":r['district'],"pincode":r['pincode']},
                "confidence":float(r['adi_score_normalized'])/100,
                "description":f"High ADI: {r['adi_score_normalized']:.1f}"
            })

    if ptype=="migration":
        top = latest.nlargest(10,'enrolment_dev')
        for _,r in top.iterrows():
            out.append({
                "type":"migration",
                "region":{"state":r['state'],"district":r['district'],"pincode":r['pincode']},
                "confidence":min(abs(float(r['enrolment_dev'])),1.0),
                "description":f"High enrolment deviation: {r['enrolment_dev']:.2f}"
            })

    return out

# -------- LEGACY PATH SUPPORT --------

@app.get("/adi")
def legacy_adi():
    return adi()

@app.get("/regions")
def legacy_regions():
    return regions()

@app.get("/patterns/{ptype}")
def legacy_patterns(ptype: str):
    return patterns(ptype)

@app.get("/timeline")
def legacy_timeline(state: str=None, district: str=None, pincode: str=None):
    return timeline(state, district, pincode)
