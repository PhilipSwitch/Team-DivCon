from django.urls import path
from users import views


# Defining a list of url patterns
urlpatterns =[
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('login/', views.login_page, name='login_page'),
]