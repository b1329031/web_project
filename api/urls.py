from django.urls import path
from . import views

urlpatterns = [
    path('words/', views.words_list),
    path('cards/', views.cards_list),
    path('user/<str:username>/', views.get_user),
    path('user/<str:username>/answer/', views.answer_word),
    path('user/<str:username>/gacha/', views.gacha),
]
