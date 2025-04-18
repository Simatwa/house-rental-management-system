"""V1 routes
"""

from api.v1.account.routes import router as account_router
from api.v1.business.routes import router as business_router
from api.v1.core.routes import router as core_router

from fastapi import APIRouter

router = APIRouter(
    prefix="/v1",
    # tags=["V1"],
)

router.include_router(account_router)
router.include_router(business_router)
router.include_router(core_router)
