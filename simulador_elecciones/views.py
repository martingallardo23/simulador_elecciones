from django.shortcuts import render
from django.http import JsonResponse
from .models import UserInput
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import hashlib
import json

def compute_hash(data):
    data_string = json.dumps(data, sort_keys=True)
    hash_object = hashlib.sha256(data_string.encode())
    hex_dig = hash_object.hexdigest()

    return hex_dig

def index(request):

    context = {}
    if 'id' in request.GET:
        id = request.GET['id']
        try:
            user_input = UserInput.objects.get(id=id)

            image_link = f"https://vercel-og-nextjs-omega-six.vercel.app/api/simulador?winner={user_input.winner}&round={user_input.round}&loser={user_input.loser}&percentage={user_input.percentage}"

            context = {
                'image_link': image_link,
                'winner': user_input.winner,
                'percentage': int(user_input.percentage),
            }
        except UserInput.DoesNotExist:
            context = {
                'image_link': "https://simulador-elecciones.s3.sa-east-1.amazonaws.com/thumbnail.png",
                'winner': None,
                'percentage': None,
            }
    else:
        context = {
            'image_link': "https://simulador-elecciones.s3.sa-east-1.amazonaws.com/thumbnail.png",
            'winner': None,
            'percentage': None,
        }
    return render(request, "simulador_elecciones/index.html", context)

def load(request):
    if 'id' in request.GET:
        id = request.GET['id']
        try:
            user_input = UserInput.objects.get(id=id)
            return JsonResponse(user_input.data)
        except UserInput.DoesNotExist:
            return JsonResponse({'error': 'Invalid id'}, status=400)
    else:
        return JsonResponse({'error': 'No id provided'}, status=400)

@csrf_exempt
def save(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    data_hash = compute_hash(data['data'])
    user_input = UserInput.objects.filter(hash=data_hash).first()

    if user_input:
        return JsonResponse({'id': user_input.id})
    
    results = data['results']
    loser = results['loser']
    loser = None if loser == 'image-template' else loser

    user_input = UserInput(
        data=data['data'],
        winner=results['winner'],
        round=results['round'],
        percentage=results['percentage'],
        loser=loser,
        hash=data_hash
    )
    user_input.save()

    return JsonResponse({'id': user_input.id})

