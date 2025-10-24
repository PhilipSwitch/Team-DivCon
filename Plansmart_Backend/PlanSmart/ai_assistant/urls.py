from django.urls import path
from users import views


# Defining a list of url patterns
urlpatterns =[
    path('', views.index) 
]