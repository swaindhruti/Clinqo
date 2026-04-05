"""add weekly slots and appointment visit type

Revision ID: 20260405_add_weekly_slots_and_visit_type
Revises: 20260405_add_appointment_intake_data
Create Date: 2026-04-05 00:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260405_add_weekly_slots_and_visit_type"
down_revision = "20260405_add_appointment_intake_data"
branch_labels = None
depends_on = None


visit_type_enum = sa.Enum("CONSULTATION", "PROCEDURE", name="visittype")


def upgrade() -> None:
    visit_type_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("appointments", sa.Column("slot_label", sa.String(length=30), nullable=True))
    op.add_column(
        "appointments",
        sa.Column(
            "visit_type",
            sa.Enum("CONSULTATION", "PROCEDURE", name="visittype"),
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
            sa.Enum("CONSULTATION", "PROCEDURE", name="visittype"),
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

    visit_type_enum.drop(op.get_bind(), checkfirst=True)
