from transformers import T5ForConditionalGeneration, T5Tokenizer, Trainer, TrainingArguments
import datasets

# Load your dataset in a Hugging Face-friendly format
dataset = datasets.load_dataset('json', data_files={'train': 'dataset_latex.jsonl'})

# Load T5 tokenizer and model
model_name = "t5-small"  # or "t5-base" depending on your preference
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# Tokenize dataset
def preprocess_function(examples):
    inputs = [ex for ex in examples['input']]  # unstructured text
    targets = [ex for ex in examples['output']]  # LaTeX output
    model_inputs = tokenizer(inputs, max_length=512, truncation=True)
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=512, truncation=True)
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

tokenized_datasets = dataset.map(preprocess_function, batched=True)

# Fine-tune the model
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=2,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets['train'],
)

trainer.train()

# Save the model and tokenizer
model.save_pretrained("./fine_tuned_model")
tokenizer.save_pretrained("./fine_tuned_model")