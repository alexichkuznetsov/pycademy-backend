import sys

code = sys.argv[1]

exec(code)

sys.stdout.flush()
sys.stderr.flush()
