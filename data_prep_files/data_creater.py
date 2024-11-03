import csv

output_file = 'dataset_final.csv'

def func(unstructured_file,latex_file):
    # Read unstructured sentences
    with open(unstructured_file, 'r') as f:
        unstructured_sentences = [line.strip().replace("paren","parenthesis") for line in f.readlines()]

    # Read LaTeX expressions
    with open(latex_file, 'r') as f:
        latex_sentences = [line.strip() for line in f.readlines()]

    # Ensure both files have the same number of sentences
    if len(unstructured_sentences) != len(latex_sentences):
        print(len(unstructured_sentences))
        print(len(latex_sentences))
        raise ValueError("The number of unstructured and LaTeX sentences does not match.")

    # Write to CSV format, skipping blank lines
    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # writer.writerow(['input', 'output'])  # Write header

        for unstructured, latex in zip(unstructured_sentences, latex_sentences):
            # Skip blank lines in unstructured text and their corresponding LaTeX
            if unstructured == '':
                continue

            writer.writerow([unstructured, latex])  # Write each row


for i in range(1,7):
    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['input', 'output'])  # Write header
    unstructured_file = "output" + str(i) + ".txt"
    latex_file = "input" + str(i) + ".txt"
    func(unstructured_file,latex_file)

print(f"Dataset saved to {output_file}")
