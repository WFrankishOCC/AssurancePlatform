from rest_framework import serializers
from .models import (
    AssuranceCase,
    TopLevelNormativeGoal,
    Context,
    SystemDescription,
    PropertyClaim,
    Argument,
    EvidentialClaim,
    Evidence,
)

class AssuranceCaseSerializer(serializers.ModelSerializer):
    goals = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = AssuranceCase
        fields = ("id", "name", "description", "created_date", "goals")


class TopLevelNormativeGoalSerializer(serializers.ModelSerializer):
    assurance_case_id = serializers.PrimaryKeyRelatedField(source="assurance_case",queryset=AssuranceCase.objects.all(),write_only=True)
    context = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    system_description = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    property_claims = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = TopLevelNormativeGoal
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "keywords",
            "assurance_case_id",
            "context",
            "system_description",
            "property_claims"
        )


class ContextSerializer(serializers.ModelSerializer):
    goal_id = serializers.PrimaryKeyRelatedField(source="goal", queryset=TopLevelNormativeGoal.objects.all(), write_only=True)
    class Meta:
        model = Context
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "created_date",
            "goal_id"
        )


class SystemDescriptionSerializer(serializers.ModelSerializer):
    goal_id = serializers.PrimaryKeyRelatedField(source="goal", queryset=TopLevelNormativeGoal.objects.all(), write_only=True)
    class Meta:
        model = SystemDescription
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "goal_id"
        )


class PropertyClaimSerializer(serializers.ModelSerializer):
    goal_id = serializers.PrimaryKeyRelatedField(
        source="goal",
        queryset=TopLevelNormativeGoal.objects.all(),
        write_only=True
    )
    arguments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = PropertyClaim
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "goal_id",
            "arguments"
        )

class ArgumentSerializer(serializers.ModelSerializer):
    property_claim_id = serializers.PrimaryKeyRelatedField(
        source="property_claim",
        queryset = PropertyClaim.objects.all(),
        write_only=True,
        many=True
    )
    evidential_claims = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True
    )
    class Meta:
        model = Argument
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "property_claim_id",
            "evidential_claims"
        )

class EvidentialClaimSerializer(serializers.ModelSerializer):
    argument_id = serializers.PrimaryKeyRelatedField(
        source="argument",
        queryset=Argument.objects.all(),
        write_only=True,
        many=False
    )
    evidence = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True
    )
    class Meta:
        model = EvidentialClaim
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "argument_id",
            "evidence"
        )


class EvidenceSerializer(serializers.ModelSerializer):
    evidential_claim_id = serializers.PrimaryKeyRelatedField(
        source="evidential_claim",
        queryset=EvidentialClaim.objects.all(),
        write_only=True,
        many=True
    )
    class Meta:
        model = Evidence
        fields = (
            "id",
            "name",
            "short_description",
            "long_description",
            "URL",
            "evidential_claim_id"
        )