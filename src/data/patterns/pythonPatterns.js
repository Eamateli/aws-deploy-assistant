/**
 * Python-specific pattern matching rules
 * Loaded dynamically when Python framework is detected
 */

export const pythonPatterns = {
  'python-flask': {
    name: 'Python Flask API',
    indicators: {
      files: ['app.py', 'requirements.txt', 'wsgi.py'],
      dependencies: ['Flask', 'flask-restful', 'flask-sqlalchemy'],
      content: ['from flask import', '@app.route', 'Flask(__name__)', 'app.run()'],
      build: ['python app.py', 'flask run', 'gunicorn']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.4,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['serverless-api', 'traditional-stack', 'container-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'python-django': {
    name: 'Python Django Application',
    indicators: {
      files: ['manage.py', 'settings.py', 'urls.py', 'requirements.txt'],
      dependencies: ['Django', 'django-rest-framework', 'psycopg2'],
      content: ['from django', 'django.contrib', 'INSTALLED_APPS', 'urlpatterns'],
      build: ['python manage.py runserver', 'django-admin']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['traditional-stack', 'container-stack'],
    requirements: {
      database: 'required',
      auth: 'required',
      realtime: 'optional',
      storage: 'required'
    }
  },
  'python-fastapi': {
    name: 'Python FastAPI Application',
    indicators: {
      files: ['main.py', 'requirements.txt', 'app.py'],
      dependencies: ['fastapi', 'uvicorn', 'pydantic'],
      content: ['from fastapi import', 'FastAPI()', '@app.get', '@app.post'],
      build: ['uvicorn main:app', 'python -m uvicorn']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.4,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['serverless-api', 'container-stack', 'traditional-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  }
};

export const pythonOptimizations = {
  bundling: {
    splitChunks: false, // Server-side doesn't need client-side splitting
    lazyLoading: false,
    treeShaking: false // Python doesn't use tree shaking like JS
  },
  deployment: {
    staticOptimization: false,
    cdnFriendly: false,
    caching: 'moderate'
  }
};

export default pythonPatterns;