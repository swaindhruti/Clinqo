"""add weekly slots and appointment visit type

Revision ID: a20260405_slots
Revises: a20260405_clinics
Create Date: 2026-04-05 00:30:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "a20260405_slots"
down_revision = "a20260405_clinics"
branch_labels = None
depends_on = None


visit_type_enum = postgresql.ENUM("CONSULTATION", "PROCEDURE", name="visittype", create_type=False)


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE visittype AS ENUM ('CONSULTATION', 'PROCEDURE');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    op.add_column("appointments", sa.Column("slot_label", sa.String(length=30), nullable=True))
    op.add_column(
        "appointments",
        sa.Column(
            "visit_type",
            postgresql.ENUM("CONSULTATION", "PROCEDURE", name="visittype", create_type=False),
            nullable=False,
            server_default="CONSULTATION",
        ),
    )

    op.create_index(
        "ix_appointment_slot_label",
        "appointments",
        ["doctor_id", "date", "slot_label", "visit_type"],
        unique=False,
    )

    op.create_table(
        "doctor_weekly_slots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("doctor_id", sa.UUID(), nullable=False),
        sa.Column("clinic_id", sa.UUID(), nullable=True),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=False),
        sa.Column("end_time", sa.String(length=5), nullable=False),
        sa.Column("max_patients", sa.Integer(), nullable=False),
        sa.Column(
            "visit_type",
            postgresql.ENUM("CONSULTATION", "PROCEDURE", name="visittype", create_type=False),
            nullable=False,
            server_default="CONSULTATION",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["clinic_id"], ["clinics.id"]),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctor_masters.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "doctor_id",
            "clinic_id",
            "weekday",
            "start_time",
            "end_time",
            "visit_type",
            name="uq_doctor_weekly_slot",
        ),
    )

    op.create_index(
        "ix_doctor_weekly_slots_lookup",
        "doctor_weekly_slots",
        ["doctor_id", "weekday", "visit_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_doctor_weekly_slots_lookup", table_name="doctor_weekly_slots")
    op.drop_table("doctor_weekly_slots")

    op.drop_index("ix_appointment_slot_label", table_name="appointments")
    op.drop_column("appointments", "visit_type")
    op.drop_column("appointments", "slot_label")

    # Keep enum type to avoid breaking existing columns that may still depend on it.
