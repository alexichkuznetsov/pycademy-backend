import sys
import requests
from bs4 import BeautifulSoup

code = sys.argv[1]

compiledCode = compile(code, 'user', 'exec')

globalDict = {
  '__builtins__': None
}

localsDict = {
  # Packages
  'requests': requests,
  'BeautifulSoup': BeautifulSoup,
  # Functions
  'print': print,
  'dir': dir,
  'sum': sum,
  'abs': abs,
  'len': len,
  'dict': dict,
  'enumerate': enumerate,
  'filter': filter,
  'float': float,
  'format': format,
  'getattr': getattr,
  'globals': globals,
  'hasattr': hasattr,
  'help': help,
  'hex': hex,
  'id': id,
  'int': int,
  'isinstance': isinstance,
  'issubclass': issubclass,
  'iter': iter,
  'list': list,
  'locals': locals,
  'map': map,
  'max': max,
  'min': min,
  'next': next,
  'object': object,
  'pow': pow,
  'property': property,
  'range': range,
  'repr': repr,
  'reversed': reversed,
  'round': round,
  'set': set,
  'setattr': setattr,
  'slice': slice,
  'sorted': sorted,
  'staticmethod': staticmethod,
  'str': str,
  'super': super,
  'tuple': tuple,
  'type': type,
  'vars': vars,
  'zip': zip
}

exec(compiledCode, globalDict, localsDict)

sys.stdout.flush()
sys.stderr.flush()

# For reference
# code = sys.argv[1]
# exec(code)
