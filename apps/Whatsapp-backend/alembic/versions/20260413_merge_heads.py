"""merge alembic heads

Revision ID: 20260413_merge_heads
Revises: 20260412_userrole_case, bf1694d1ff15
Create Date: 2026-04-13
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260413_merge_heads"
down_revision: Union[str, Sequence[str], None] = ("20260412_userrole_case", "bf1694d1ff15")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
