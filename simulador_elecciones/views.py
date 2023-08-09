from django.shortcuts import render
from django.http import JsonResponse
from .models import UserInput
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import hashlib
import json

def compute_hash(data):
    # Convert the data to a JSON string
    data_string = json.dumps(data, sort_keys=True)

    # Compute the SHA-256 hash of the string
    hash_object = hashlib.sha256(data_string.encode())

    # Convert the hash object to a hexadecimal string
    hex_dig = hash_object.hexdigest()

    return hex_dig

def index(request):
    # get id parameter from request
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


def index_alt(request):
    # get id parameter from request
    context = {}
    if 'id' in request.GET:
        id = request.GET['id']
        try:
            user_input = UserInput.objects.get(id=id)

            image_link = f"https://vercel-og-nextjs-omega-six.vercel.app/api/simulador?winner={user_input.winner}&round={user_input.round}&loser={user_input.loser}&percentage={user_input.percentage}&cache=1"

            context = {
                'image_link': image_link,
                'winner': user_input.winner,
                'percentage': int(user_input.percentage),
            }
        except UserInput.DoesNotExist:
            context = {
                'image_link': "https://simulador-elecciones.s3.sa-east-1.amazonaws.com/thumbnail.png?id=1",
                'winner': None,
                'percentage': None,
            }
    else:
        context = {
            'image_link': "https://simulador-elecciones.s3.sa-east-1.amazonaws.com/thumbnail.png?id=1",
            'winner': None,
            'percentage': None,
        }
    return render(request, "simulador_elecciones/index_alt.html", context)

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
    if request.method == 'POST':
        data = json.loads(request.body) 
        hash = compute_hash(data['data'])
        if UserInput.objects.filter(hash=hash).exists():
            user_input = UserInput.objects.get(hash=hash)
            return JsonResponse({'id': user_input.id})
        else:
            user_input = UserInput(data=data['data'])
            results = data['results']
            user_input.winner = results['winner']
            user_input.round = results['round']
            user_input.percentage = results['percentage']
            loser = results['loser']
            if loser == 'image-template':
                user_input.loser = None
            else:
                user_input.loser = loser  
            user_input.hash = hash 
            user_input.save()
            return JsonResponse({'id': user_input.id}) 
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)
