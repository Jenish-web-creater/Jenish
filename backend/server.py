from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import random
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Geth Private Blockchain Dashboard API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class BlockchainStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    chain_id: int = 1337
    network_name: str = "Private Geth Network"
    is_syncing: bool = False
    current_block: int
    highest_block: int
    peer_count: int
    gas_price: str
    pending_transactions: int
    timestamp: str

class BeaconStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_name: str = "Lighthouse"
    version: str = "v5.3.0"
    is_syncing: bool = False
    head_slot: int
    sync_distance: int
    is_optimistic: bool = False
    el_offline: bool = False
    peer_count: int
    finalized_epoch: int
    justified_epoch: int
    timestamp: str

class SignerStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    signer_name: str = "Clef"
    version: str = "v1.14.12"
    is_connected: bool = True
    accounts: List[str]
    pending_requests: int
    timestamp: str

class NodeInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    geth_version: str = "Geth/v1.14.12-stable/linux-amd64/go1.22.0"
    lighthouse_version: str = "Lighthouse/v5.3.0"
    clef_version: str = "Clef/v1.14.12"
    chain_id: int = 1337
    network_id: int = 1337
    enode: str
    data_dir: str = "/data/geth"
    ipc_path: str = "/data/geth/geth.ipc"
    http_enabled: bool = True
    http_port: int = 8545
    ws_enabled: bool = True
    ws_port: int = 8546
    timestamp: str

class Block(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    hash: str
    parent_hash: str
    nonce: str
    miner: str
    difficulty: str
    total_difficulty: str
    size: int
    gas_limit: int
    gas_used: int
    timestamp: str
    transactions_count: int
    extra_data: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hash: str
    block_number: Optional[int] = None
    block_hash: Optional[str] = None
    from_address: str
    to_address: str
    value: str
    gas: int
    gas_price: str
    nonce: int
    input_data: str
    status: str  # pending, confirmed, failed
    timestamp: str

class TransactionCreate(BaseModel):
    from_address: str
    to_address: str
    value: str
    gas: int = 21000
    data: str = "0x"

class Account(BaseModel):
    model_config = ConfigDict(extra="ignore")
    address: str
    balance: str
    nonce: int
    is_contract: bool = False
    created_at: str

# ===================== UTILITY FUNCTIONS =====================

def generate_hash() -> str:
    return "0x" + secrets.token_hex(32)

def generate_address() -> str:
    return "0x" + secrets.token_hex(20)

def wei_to_eth(wei: int) -> str:
    return f"{wei / 10**18:.6f} ETH"

def eth_to_wei(eth: float) -> int:
    return int(eth * 10**18)

# ===================== BLOCKCHAIN SIMULATION =====================

# Simulated state
blockchain_state = {
    "current_block": 15847293,
    "peer_count": 8,
    "gas_price": "20000000000",  # 20 gwei
    "pending_tx": 3,
    "head_slot": 234567,
    "finalized_epoch": 7329,
    "justified_epoch": 7330,
}

# Default accounts (simulated Clef managed accounts)
DEFAULT_ACCOUNTS = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f3e421",
    "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
]

# ===================== API ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Geth Private Blockchain Dashboard API", "version": "1.0.0"}

# Blockchain Status
@api_router.get("/blockchain/status", response_model=BlockchainStatus)
async def get_blockchain_status():
    # Simulate slight changes in state
    blockchain_state["current_block"] += random.randint(0, 2)
    blockchain_state["pending_tx"] = random.randint(0, 10)
    blockchain_state["peer_count"] = random.randint(5, 12)
    
    return BlockchainStatus(
        current_block=blockchain_state["current_block"],
        highest_block=blockchain_state["current_block"] + random.randint(0, 2),
        peer_count=blockchain_state["peer_count"],
        gas_price=f"{int(blockchain_state['gas_price']) // 10**9} Gwei",
        pending_transactions=blockchain_state["pending_tx"],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

# Beacon Status
@api_router.get("/beacon/status", response_model=BeaconStatus)
async def get_beacon_status():
    blockchain_state["head_slot"] += random.randint(0, 3)
    
    return BeaconStatus(
        head_slot=blockchain_state["head_slot"],
        sync_distance=random.randint(0, 5),
        peer_count=random.randint(20, 50),
        finalized_epoch=blockchain_state["finalized_epoch"],
        justified_epoch=blockchain_state["justified_epoch"],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

# Signer Status
@api_router.get("/signer/status", response_model=SignerStatus)
async def get_signer_status():
    # Get accounts from DB or use defaults
    accounts_cursor = db.accounts.find({}, {"_id": 0, "address": 1})
    accounts = await accounts_cursor.to_list(100)
    account_addresses = [acc["address"] for acc in accounts] if accounts else DEFAULT_ACCOUNTS
    
    return SignerStatus(
        accounts=account_addresses,
        pending_requests=random.randint(0, 3),
        timestamp=datetime.now(timezone.utc).isoformat()
    )

# Node Info
@api_router.get("/node-info", response_model=NodeInfo)
async def get_node_info():
    return NodeInfo(
        enode=f"enode://{secrets.token_hex(64)}@127.0.0.1:30303",
        timestamp=datetime.now(timezone.utc).isoformat()
    )

# ===================== BLOCKS =====================

@api_router.get("/blocks", response_model=List[Block])
async def get_blocks(limit: int = 20, offset: int = 0):
    # Check DB for blocks, generate if empty
    blocks_cursor = db.blocks.find({}, {"_id": 0}).sort("number", -1).skip(offset).limit(limit)
    blocks = await blocks_cursor.to_list(limit)
    
    if not blocks:
        # Generate initial blocks
        await generate_blocks(50)
        blocks_cursor = db.blocks.find({}, {"_id": 0}).sort("number", -1).skip(offset).limit(limit)
        blocks = await blocks_cursor.to_list(limit)
    
    return blocks

@api_router.get("/blocks/{block_number}", response_model=Block)
async def get_block(block_number: int):
    block = await db.blocks.find_one({"number": block_number}, {"_id": 0})
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block

async def generate_blocks(count: int):
    """Generate simulated blocks"""
    base_block = blockchain_state["current_block"] - count
    blocks = []
    parent_hash = generate_hash()
    
    for i in range(count):
        block_num = base_block + i
        block_hash = generate_hash()
        timestamp = datetime.now(timezone.utc)
        
        block = {
            "id": str(uuid.uuid4()),
            "number": block_num,
            "hash": block_hash,
            "parent_hash": parent_hash,
            "nonce": "0x" + secrets.token_hex(8),
            "miner": random.choice(DEFAULT_ACCOUNTS),
            "difficulty": "0x0",
            "total_difficulty": "0x0",
            "size": random.randint(500, 50000),
            "gas_limit": 30000000,
            "gas_used": random.randint(0, 15000000),
            "timestamp": timestamp.isoformat(),
            "transactions_count": random.randint(0, 50),
            "extra_data": "0x"
        }
        blocks.append(block)
        parent_hash = block_hash
    
    if blocks:
        await db.blocks.insert_many(blocks)

# ===================== TRANSACTIONS =====================

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(limit: int = 50, offset: int = 0, status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    tx_cursor = db.transactions.find(query, {"_id": 0}).sort("timestamp", -1).skip(offset).limit(limit)
    transactions = await tx_cursor.to_list(limit)
    
    if not transactions:
        # Generate initial transactions
        await generate_transactions(30)
        tx_cursor = db.transactions.find(query, {"_id": 0}).sort("timestamp", -1).skip(offset).limit(limit)
        transactions = await tx_cursor.to_list(limit)
    
    return transactions

@api_router.get("/transactions/{tx_hash}", response_model=Transaction)
async def get_transaction(tx_hash: str):
    tx = await db.transactions.find_one({"hash": tx_hash}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(tx_data: TransactionCreate):
    """Create and sign a new transaction via Clef"""
    # Verify from_address is a Clef-managed account
    accounts_cursor = db.accounts.find({}, {"_id": 0, "address": 1})
    accounts = await accounts_cursor.to_list(100)
    account_addresses = [acc["address"].lower() for acc in accounts] if accounts else [a.lower() for a in DEFAULT_ACCOUNTS]
    
    if tx_data.from_address.lower() not in account_addresses:
        raise HTTPException(status_code=400, detail="From address not managed by Clef signer")
    
    # Get account nonce
    account = await db.accounts.find_one({"address": {"$regex": tx_data.from_address, "$options": "i"}}, {"_id": 0})
    nonce = account["nonce"] if account else 0
    
    # Create transaction
    tx = Transaction(
        hash=generate_hash(),
        from_address=tx_data.from_address,
        to_address=tx_data.to_address,
        value=tx_data.value,
        gas=tx_data.gas,
        gas_price=f"{int(blockchain_state['gas_price']) // 10**9} Gwei",
        nonce=nonce,
        input_data=tx_data.data,
        status="pending",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    # Save to DB
    await db.transactions.insert_one(tx.model_dump())
    
    # Update account nonce
    await db.accounts.update_one(
        {"address": {"$regex": tx_data.from_address, "$options": "i"}},
        {"$inc": {"nonce": 1}}
    )
    
    # Simulate transaction confirmation after a short delay (in real implementation this would be async)
    # For now, we'll just update it immediately with a confirmed status
    await db.transactions.update_one(
        {"hash": tx.hash},
        {"$set": {
            "status": "confirmed",
            "block_number": blockchain_state["current_block"],
            "block_hash": generate_hash()
        }}
    )
    
    # Fetch updated transaction
    updated_tx = await db.transactions.find_one({"hash": tx.hash}, {"_id": 0})
    return updated_tx

async def generate_transactions(count: int):
    """Generate simulated transactions"""
    transactions = []
    
    for _ in range(count):
        from_addr = random.choice(DEFAULT_ACCOUNTS)
        to_addr = generate_address() if random.random() > 0.3 else random.choice(DEFAULT_ACCOUNTS)
        value = random.randint(0, 10 * 10**18)  # 0-10 ETH in wei
        
        tx = {
            "id": str(uuid.uuid4()),
            "hash": generate_hash(),
            "block_number": blockchain_state["current_block"] - random.randint(0, 100),
            "block_hash": generate_hash(),
            "from_address": from_addr,
            "to_address": to_addr,
            "value": wei_to_eth(value),
            "gas": 21000 + random.randint(0, 100000),
            "gas_price": f"{random.randint(10, 50)} Gwei",
            "nonce": random.randint(0, 1000),
            "input_data": "0x" if random.random() > 0.2 else "0x" + secrets.token_hex(random.randint(10, 100)),
            "status": random.choice(["confirmed", "confirmed", "confirmed", "pending", "failed"]),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        transactions.append(tx)
    
    if transactions:
        await db.transactions.insert_many(transactions)

# ===================== ACCOUNTS =====================

@api_router.get("/accounts", response_model=List[Account])
async def get_accounts():
    accounts_cursor = db.accounts.find({}, {"_id": 0})
    accounts = await accounts_cursor.to_list(100)
    
    if not accounts:
        # Initialize default accounts
        await initialize_accounts()
        accounts_cursor = db.accounts.find({}, {"_id": 0})
        accounts = await accounts_cursor.to_list(100)
    
    return accounts

@api_router.get("/accounts/{address}", response_model=Account)
async def get_account(address: str):
    account = await db.accounts.find_one({"address": {"$regex": address, "$options": "i"}}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

async def initialize_accounts():
    """Initialize default Clef-managed accounts"""
    accounts = []
    for addr in DEFAULT_ACCOUNTS:
        balance = random.randint(100, 10000) * 10**18  # 100-10000 ETH
        account = {
            "address": addr,
            "balance": wei_to_eth(balance),
            "nonce": random.randint(0, 100),
            "is_contract": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        accounts.append(account)
    
    await db.accounts.insert_many(accounts)

# ===================== STATS =====================

@api_router.get("/stats/overview")
async def get_stats_overview():
    """Get overview statistics for dashboard"""
    total_transactions = await db.transactions.count_documents({})
    confirmed_transactions = await db.transactions.count_documents({"status": "confirmed"})
    pending_transactions = await db.transactions.count_documents({"status": "pending"})
    failed_transactions = await db.transactions.count_documents({"status": "failed"})
    total_blocks = await db.blocks.count_documents({})
    total_accounts = await db.accounts.count_documents({})
    
    return {
        "total_transactions": total_transactions,
        "confirmed_transactions": confirmed_transactions,
        "pending_transactions": pending_transactions,
        "failed_transactions": failed_transactions,
        "total_blocks": total_blocks,
        "total_accounts": total_accounts,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/stats/gas-history")
async def get_gas_history():
    """Get gas price history for charts"""
    history = []
    for i in range(24):
        history.append({
            "hour": f"{i:02d}:00",
            "gas_price": random.randint(15, 50),
            "transactions": random.randint(10, 200)
        })
    return history

@api_router.get("/stats/block-history")
async def get_block_history():
    """Get block production history"""
    history = []
    for i in range(24):
        history.append({
            "hour": f"{i:02d}:00",
            "blocks": random.randint(200, 350),
            "gas_used": random.randint(5000000, 15000000)
        })
    return history

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
