from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework import viewsets
from rest_framework import permissions
from .models import AssuranceCase, TopLevelNormativeGoal
from .serializers import (
    AssuranceCaseSerializer,
    TopLevelNormativeGoalSerializer,
    ContextSerializer,
    SystemDescriptionSerializer,
    PropertyClaimSerializer,
    ArgumentSerializer,
    EvidentialClaimSerializer,
    EvidenceSerializer
)


@csrf_exempt
def case_list(request):
    """
    List all cases, or make a new case
    """
    if request.method == "GET":
        cases = AssuranceCase.objects.all()
        serializer = AssuranceCaseSerializer(cases, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = AssuranceCaseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)


@csrf_exempt
def case_detail(request, pk):
    """
    Retrieve, update, or delete an AssuranceCase, by primary key
    """
    try:
        case = AssuranceCase.objects.get(pk=pk)
    except AssuranceCase.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = AssuranceCaseSerializer(case)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = AssuranceCaseSerializer(case, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        case.delete()
        return HttpResponse(status=204)


@csrf_exempt
def goal_list(request):
    """
    List all goals, or make a new goal
    """
    if request.method == "GET":
        goals = TopLevelNormativeGoal.objects.all()
        serializer = TopLevelNormativeGoalSerializer(goals, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        assurance_case = AssuranceCase.objects.get(id=data["assurance_case_id"])
        data["assurance_case"] = AssuranceCaseSerializer(assurance_case).data["id"]
        serializer = TopLevelNormativeGoalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)


@csrf_exempt
def goal_detail(request, pk):
    """
    Retrieve, update, or delete a TopLevelNormativeGoal, by primary key
    """
    try:
        goal = TopLevelNormativeGoal.objects.get(pk=pk)
    except TopLevelNormativeGoal.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = TopLevelNormativeGoalSerializer(goal)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = TopLevelNormativeGoalSerializer(goal, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        goal.delete()
        return HttpResponse(status=204)


@csrf_exempt
def context_list(request):
    """
    List all contexts, or make a new context
    """
    if request.method == "GET":
        contexts = Context.objects.all()
        serializer = ContextSerializer(contexts, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = ContextSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def context_detail(request, pk):
    """
    Retrieve, update, or delete a Context, by primary key
    """
    try:
        context = Context.objects.get(pk=pk)
    except Context.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = ContextSerializer(context)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = ContextSerializer(context, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        context.delete()
        return HttpResponse(status=204)


@csrf_exempt
def description_list(request):
    """
    List all descriptions, or make a new description
    """
    if request.method == "GET":
        descriptions = SystemDescription.objects.all()
        serializer = SystemDescriptionSerializer(descriptions, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = SystemDescriptionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def description_detail(request, pk):
    """
    Retrieve, update, or delete a SystemDescription, by primary key
    """
    try:
        description = SystemDescription.objects.get(pk=pk)
    except SystemDescription.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = SystemDescriptionSerializer(description)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = SystemDescriptionSerializer(description, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        description.delete()
        return HttpResponse(status=204)

@csrf_exempt
def property_claim_list(request):
    """
    List all claims, or make a new claim
    """
    if request.method == "GET":
        claims = PropertyClaim.objects.all()
        serializer = PropertyClaimSerializer(claims, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = PropertyClaimSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def property_claim_detail(request, pk):
    """
    Retrieve, update, or delete a PropertyClaim, by primary key
    """
    try:
        claim = PropertyClaim.objects.get(pk=pk)
    except PropertyClaim.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = PropertyClaimSerializer(claim)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = PropertyClaimSerializer(claim, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        claim.delete()
        return HttpResponse(status=204)


@csrf_exempt
def argument_list(request):
    """
    List all arguments, or make a new argument
    """
    if request.method == "GET":
        arguments = Argument.objects.all()
        serializer = ArgumentSerializer(arguments, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = ArgumentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def argument_detail(request, pk):
    """
    Retrieve, update, or delete a Argument, by primary key
    """
    try:
        argument = Argument.objects.get(pk=pk)
    except Argument.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = ArgumentSerializer(argument)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = ArgumentSerializer(argument, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        argument.delete()
        return HttpResponse(status=204)


@csrf_exempt
def evidential_claim_list(request):
    """
    List all evidential_claims, or make a new evidential_claim
    """
    if request.method == "GET":
        evidential_claims = EvidentialClaim.objects.all()
        serializer = EvidentialClaimSerializer(evidential_claims, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = EvidentialClaimSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def evidential_claim_detail(request, pk):
    """
    Retrieve, update, or delete a EvidentialClaim, by primary key
    """
    try:
        evidential_claim = EvidentialClaim.objects.get(pk=pk)
    except EvidentialClaim.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = EvidentialClaimSerializer(evidential_claim)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = EvidentialClaimSerializer(evidential_claim, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        evidential_claim.delete()
        return HttpResponse(status=204)


@csrf_exempt
def evidence_list(request):
    """
    List all evidences, or make a new evidence
    """
    if request.method == "GET":
        evidences = Evidence.objects.all()
        serializer = EvidenceSerializer(evidences, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == "POST":
        data = JSONParser().parse(request)
        serializer = EvidenceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def evidence_detail(request, pk):
    """
    Retrieve, update, or delete a Evidence, by primary key
    """
    try:
        evidence = Evidence.objects.get(pk=pk)
    except Evidence.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":
        serializer = EvidenceSerializer(evidence)
        return JsonResponse(serializer.data)
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        serializer = EvidenceSerializer(evidence, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == "DELETE":
        evidence.delete()
        return HttpResponse(status=204)
