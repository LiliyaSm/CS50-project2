from flask import redirect, render_template, request, session
from functools import wraps


def login_required(f):
    
    # if a user goes to the site and is not logged in, they should be redirected to the login page.
    # https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/#login-required-decorator
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("username") is None:
            return redirect("/")
        return f(*args, **kwargs)
    return decorated_function
