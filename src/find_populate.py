
import os

def find_populate(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if 'populate' in line:
                            print(f"{path}:{i+1}: {line.strip()}")

find_populate('task/src')
