import json

# File paths
unstructured_file = 'unstructured.txt'  # Unstructured speech text
latex_file = 'latex.txt'  # Corresponding LaTeX expressions
output_file = 'dataset_latex.jsonl'

# Read unstructured sentences
with open(unstructured_file, 'r') as f:
    unstructured_sentences = [line.strip() for line in f.readlines()]

# Read LaTeX expressions
with open(latex_file, 'r') as f:
    latex_sentences = [line.strip() for line in f.readlines()]

# Ensure both files have the same number of sentences
if len(unstructured_sentences) != len(latex_sentences):
    raise ValueError("The number of unstructured and LaTeX sentences does not match.")

# Write to JSONL format
with open(output_file, 'w') as f:
    for unstructured, latex in zip(unstructured_sentences, latex_sentences):
        json_line = {
            "input": unstructured,
            "output": latex
        }
        f.write(json.dumps(json_line) + '\n')

print(f"Dataset saved to {output_file}")
