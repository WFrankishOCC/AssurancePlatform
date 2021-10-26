from rest_framework import serializers
from .models import AssuranceCase, TopLevelNormativeGoal

class AssuranceCaseSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = AssuranceCase
        fields = ['name','description','shape','created_date']

class TopLevelNormativeGoalSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TopLevelNormativeGoal
        fields = ['name','short_description','long_description','keywords','shape']
