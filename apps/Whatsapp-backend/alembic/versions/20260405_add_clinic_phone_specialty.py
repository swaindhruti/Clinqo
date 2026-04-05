"""add phone and specialty to clinics

Revision ID: a20260405_clinicfix
Revises: a20260405_userlinks
Create Date: 2026-04-05 22:50:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a20260405_clinicfix"
down_revision = "a20260405_userlinks"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE clinics
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        """
    )

    op.execute(
        """
        ALTER TABLE clinics
        ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE clinics
        DROP COLUMN IF EXISTS specialty;
        """
    )

    op.execute(
        """
        ALTER TABLE clinics
        DROP COLUMN IF EXISTS phone;
        """
    )
