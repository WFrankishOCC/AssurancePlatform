from rest_framework import serializers

from .models import (
    AssuranceCase,
    Context,
    EAPGroup,
    EAPUser,
    Evidence,
    PropertyClaim,
    Strategy,
    TopLevelNormativeGoal,
)


class EAPUserSerializer(serializers.ModelSerializer):
    all_groups = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, required=False
    )
    owned_groups = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, required=False
    )

    class Meta:
        model = EAPUser
        fields = (
            "id",
            "username",
            "email",
            "last_login",
            "date_joined",
            "is_staff",
            "all_groups",
            "owned_groups",
        )


class EAPGroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(
        source="member", many=True, queryset=EAPUser.objects.all()
    )
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner", queryset=EAPUser.objects.all()
    )
    viewable_cases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    editable_cases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = EAPGroup
        fields = (
            "id",
            "name",
            "owner_id",
            "members",
            "viewable_cases",
            "editable_cases",
        )


class AssuranceCaseSerializer(serializers.ModelSerializer):
    goals = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    type = serializers.CharField(default="AssuranceCase", read_only=True)

    class Meta:
        model = AssuranceCase
        fields = (
            "id",
            "type",
            "name",
            "description",
            "created_date",
            "lock_uuid",
            "goals",
            "owner",
            "edit_groups",
            "view_groups",
        )


class TopLevelNormativeGoalSerializer(serializers.ModelSerializer):
    assurance_case_id = serializers.PrimaryKeyRelatedField(
        source="assurance_case", queryset=AssuranceCase.objects.all()
    )
    context = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    property_claims = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    strategies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    type = serializers.CharField(default="TopLevelNormativeGoal", read_only=True)

    class Meta:
        model = TopLevelNormativeGoal
        fields = (
            "id",
            "type",
            "name",
            "short_description",
            "long_description",
            "keywords",
            "assurance_case_id",
            "context",
            "property_claims",
            "strategies",
        )


class ContextSerializer(serializers.ModelSerializer):
    goal_id = serializers.PrimaryKeyRelatedField(
        source="goal", queryset=TopLevelNormativeGoal.objects.all()
    )
    type = serializers.CharField(default="Context", read_only=True)

    class Meta:
        model = Context
        fields = (
            "id",
            "type",
            "name",
            "short_description",
            "long_description",
            "created_date",
            "goal_id",
        )


class PropertyClaimSerializer(serializers.ModelSerializer):
    goal_id = serializers.PrimaryKeyRelatedField(
        source="goal",
        queryset=TopLevelNormativeGoal.objects.all(),
        required=False,
    )
    property_claim_id = serializers.PrimaryKeyRelatedField(
        source="property_claim",
        queryset=PropertyClaim.objects.all(),
        required=False,
    )
    strategy = serializers.PrimaryKeyRelatedField(
        source="strategy",
        queryset=Strategy.objects.all(),
        required=False,
    )

    level = serializers.IntegerField(read_only=True)
    claim_type = serializers.CharField(default="Project claim")
    property_claims = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    # Use SerializerMethodField to handle the possibility of property_claim being None
    evidence = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    type = serializers.CharField(default="PropertyClaim", read_only=True)

    class Meta:
        model = PropertyClaim
        fields = (
            "id",
            "type",
            "name",
            "short_description",
            "long_description",
            "goal_id",
            "property_claim_id",
            "level",
            "claim_type",
            "property_claims",
            "evidence",
        )


class EvidenceSerializer(serializers.ModelSerializer):
    property_claim_id = serializers.PrimaryKeyRelatedField(
        source="property_claim",
        queryset=PropertyClaim.objects.all(),
        many=True,
    )
    type = serializers.CharField(default="Evidence", read_only=True)

    class Meta:
        model = Evidence
        fields = (
            "id",
            "type",
            "name",
            "short_description",
            "long_description",
            "URL",
            "property_claim_id",
        )


class StrategySerializer(serializers.ModelSerializer):
    property_claims = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Strategy
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "goal",
            "property_claims",
        )
