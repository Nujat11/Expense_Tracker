import os
from pymongo import MongoClient, ReturnDocument

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["expense_tracker"]

def get_next_sequence_value(sequence_name: str) -> int:
    """
    Atomically increments and returns a sequential integer ID for collections.
    """
    result = db["counters"].find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return result["sequence_value"]
