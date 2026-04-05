"""add appointment intake data

Revision ID: a20260405_intake
Revises: ef1a2b3c4d5e
Create Date: 2026-04-05 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a20260405_intake"
down_revision = "ef1a2b3c4d5e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "appointments",
        sa.Column("intake_data", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("appointments", "intake_data")