from openai import OpenAI

# Set the base URL and API key for the aimlapi service
base_url = "https://api.aimlapi.com/v1"
api_key = "a18847d741754369b7318dd0158266c0"
system_prompt = "Summarize the following content in a concise, informative way."

# Initialize the OpenAI API with your key and base URL
api = OpenAI(api_key=api_key, base_url=base_url)

def summarize_content(article_content):
    """Summarizes the given article content using the API."""
    try:
        completion = api.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": article_content},
            ],
            temperature=0.7,
            max_tokens=256,
        )

        response = completion.choices[0].message.content
        return response

    except Exception as e:
        print("Error summarizing content:", e)
        return "Error in summarization."

# Test the summarizer with sample content (Optional)
if __name__ == "__main__":
    sample_content = "Your article content here..."
    summary = summarize_content(sample_content)
    print("Summary:", summary)
