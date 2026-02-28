import codecs, os

path = r'c:\Users\Farhan\Desktop\diabeto\diebito-main\.env.local'

# Read using utf-16 (handles BOM automatically)
with codecs.open(path, 'r', encoding='utf-16') as f:
    content = f.read()

print("=== Current .env.local contents ===")
print(content)
print("=== End ===")

# Write back as UTF-8 (what Next.js requires)
with codecs.open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nFile re-saved as UTF-8 successfully!")
