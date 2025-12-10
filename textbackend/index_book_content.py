import os
import re
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import uuid
import json

load_dotenv()

# Initialize Qdrant client
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def create_collection():
    """Create the collection if it doesn't exist"""
    try:
        qdrant.get_collection("ai_native_book")
        print("Collection 'ai_native_book' already exists")
        # Clear existing collection to start fresh
        qdrant.delete_collection("ai_native_book")
        print("Deleted existing collection to start fresh")
    except:
        pass

    # Create new collection
    qdrant.create_collection(
        collection_name="ai_native_book",
        vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
    )
    print("Collection 'ai_native_book' created")

def clean_markdown_content(content):
    """Remove markdown formatting to get clean text"""
    # Remove markdown headers
    content = re.sub(r'^#+\s+', '', content, flags=re.MULTILINE)
    # Remove markdown bold/italic
    content = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', content)
    # Remove markdown links [text](url) -> text
    content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)
    # Remove markdown code blocks
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    # Remove inline code
    content = re.sub(r'`([^`]+)`', r'\1', content)
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n', '\n\n', content)
    return content.strip()

def chunk_text(text, max_length=500):
    """Split text into smaller chunks to fit in embeddings"""
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk + " " + sentence) <= max_length:
            current_chunk += " " + sentence if current_chunk else sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks if chunks else [text[:max_length]]

def process_markdown_file(filepath, chapter_name, section_name):
    """Process a markdown file and return content chunks with metadata"""
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # Clean the content
    clean_content = clean_markdown_content(content)

    # Split into chunks
    chunks = chunk_text(clean_content)

    content_list = []
    for i, chunk in enumerate(chunks):
        if chunk.strip():  # Only add non-empty chunks
            content_list.append({
                "text": chunk,
                "chapter": chapter_name,
                "section": f"{section_name} - Part {i+1}" if len(chunks) > 1 else section_name,
                "title": f"{chapter_name} - {section_name}"
            })

    return content_list

def index_book_content_from_directory(directory_path):
    """Recursively index all markdown content from the book directory"""
    content_list = []

    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.endswith(('.md', '.txt')):
                filepath = os.path.join(root, file)

                # Extract chapter and section names from path
                rel_path = os.path.relpath(filepath, directory_path)
                path_parts = rel_path.split(os.sep)

                if len(path_parts) >= 1:
                    if path_parts[0].startswith('module'):
                        chapter_name = path_parts[0].replace('_', ' ').title()
                        section_name = os.path.splitext(path_parts[-1])[0].replace('-', ' ').title()
                    else:
                        chapter_name = os.path.dirname(rel_path) or "Introduction"
                        section_name = os.path.splitext(path_parts[-1])[0].replace('-', ' ').title()

                file_content_list = process_markdown_file(filepath, chapter_name, section_name)
                content_list.extend(file_content_list)

    return content_list

def add_website_content():
    """Add website-related content for general queries"""
    website_content = [
        {
            "text": "This is an AI Native Book Platform. It provides interactive learning experiences about AI, robotics, and physical AI systems. The platform includes courses on humanoid robotics, ROS 2, machine learning, and AI applications.",
            "chapter": "Platform Overview",
            "section": "General Information",
            "title": "About the Platform"
        },
        {
            "text": "The platform offers courses on Physical AI and Humanoid Robotics. Students learn to design, simulate, and deploy humanoid robots using ROS 2, Gazebo, and NVIDIA Isaac. The courses bridge the gap between digital AI and physical robotics.",
            "chapter": "Platform Overview",
            "section": "Course Information",
            "title": "Course Offerings"
        },
        {
            "text": "The main features include interactive chatbot assistance, module-based learning, practical exercises, and project-based learning. Students work with real robotics frameworks and simulation environments.",
            "chapter": "Platform Overview",
            "section": "Features",
            "title": "Platform Features"
        },
        {
            "text": "To get started with the platform, navigate through the modules in sequence. Each module builds upon previous knowledge. Start with Module 1: The Robotic Nervous System (ROS 2) and progress through the curriculum.",
            "chapter": "Platform Overview",
            "section": "Getting Started",
            "title": "Getting Started Guide"
        },
        {
            "text": "The chatbot is available to answer questions about the course content, provide explanations about robotics concepts, help with technical issues, and guide students through the learning process. Ask specific questions about modules, assignments, or concepts.",
            "chapter": "Platform Overview",
            "section": "Chatbot Usage",
            "title": "Using the Chatbot"
        },
        {
            "text": "Technical requirements include knowledge of Python programming, basic understanding of AI concepts, access to a computer capable of running simulation software, and familiarity with Linux command line. Some modules may require specific hardware for practical exercises.",
            "chapter": "Platform Overview",
            "section": "Requirements",
            "title": "Technical Requirements"
        },
        {
            "text": "The course covers ROS 2 (Robot Operating System), Nodes, Topics, and Services, Bridging Python Agents to ROS controllers, URDF (Unified Robot Description Format) for humanoids, simulation with Gazebo, and NVIDIA Isaac for robot deployment.",
            "chapter": "Course Content",
            "section": "Main Topics",
            "title": "Core Technologies"
        }
    ]

    return website_content

def index_content_to_qdrant(content_list):
    """Index content to Qdrant with embeddings"""
    points = []

    for i, content in enumerate(content_list):
        # Generate embedding for the text
        embedding = embedding_model.encode([content['text']])[0].tolist()

        point = models.PointStruct(
            id=i,
            vector=embedding,
            payload={
                "text": content['text'],
                "metadata": {
                    "chapter": content.get('chapter', 'Unknown'),
                    "section": content.get('section', 'Unknown'),
                    "title": content.get('title', 'No Title')
                }
            }
        )
        points.append(point)

    # Upload points to Qdrant
    if points:
        qdrant.upsert(
            collection_name="ai_native_book",
            points=points
        )
        print(f"Indexed {len(points)} content pieces into Qdrant")
    else:
        print("No content to index")

def main():
    print("Starting to index book content...")

    # Create collection
    create_collection()

    # Get book content from directory
    book_dir = "E:\\7- q4-hackathon_spec-book\\The-AI-Native-Book-Platform\\docs\\physical-ai-humanoid-robotics"
    print(f"Processing content from: {book_dir}")

    book_content = index_book_content_from_directory(book_dir)
    print(f"Found {len(book_content)} content pieces from the book")

    # Add website-related content
    website_content = add_website_content()
    print(f"Added {len(website_content)} website-related content pieces")

    # Combine all content
    all_content = book_content + website_content

    # Index to Qdrant
    index_content_to_qdrant(all_content)

    print(f"Total indexed: {len(all_content)} content pieces")
    print("Book content indexed successfully!")
    print("The chatbot can now answer questions about the book and website!")

if __name__ == "__main__":
    main()