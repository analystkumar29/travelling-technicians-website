#!/usr/bin/env python3
"""
Script to update remaining static city pages with dynamic phone number system.
Updates: North Vancouver, West Vancouver, New Westminster, Chilliwack
"""

import os
import re
from pathlib import Path

# Define the files to update
FILES_TO_UPDATE = [
    {
        "path": "src/pages/repair/north-vancouver.tsx",
        "city_name": "north-vancouver",
        "city_display": "North Vancouver"
    },
    {
        "path": "src/pages/repair/west-vancouver.tsx",
        "city_name": "west-vancouver", 
        "city_display": "West Vancouver"
    },
    {
        "path": "src/pages/repair/new-westminster.tsx",
        "city_name": "new-westminster",
        "city_display": "New Westminster"
    },
    {
        "path": "src/pages/repair/chilliwack.tsx",
        "city_name": "chilliwack",
        "city_display": "Chilliwack"
    }
]

def update_file(file_info):
    """Update a single file with dynamic phone number system."""
    file_path = Path(file_info["path"])
    city_name = file_info["city_name"]
    city_display = file_info["city_display"]
    
    print(f"📝 Updating {file_path}...")
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    # Read the file content
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Add import for useSimplePhoneNumber hook
    import_pattern = r'import \{ LocalBusinessSchema \} from \'@/components/seo/StructuredData\';'
    import_replacement = 'import { LocalBusinessSchema } from \'@/components/seo/StructuredData\';\nimport { useSimplePhoneNumber } from \'@/hooks/useBusinessSettings\';'
    
    if 'useSimplePhoneNumber' not in content:
        content = re.sub(import_pattern, import_replacement, content)
        print(f"  ✅ Added useSimplePhoneNumber import")
    
    # 2. Add hook usage in component function
    component_pattern = r'export default function (\w+)RepairPage\(\) \{\s*\n\s*return \('
    component_replacement = f'export default function \\1RepairPage() {{\n  const {{ display: phoneDisplay, href: phoneHref, loading: phoneLoading }} = useSimplePhoneNumber(\'{city_name}\');\n  \n  return ('
    
    if 'useSimplePhoneNumber' not in content:
        content = re.sub(component_pattern, component_replacement, content)
        print(f"  ✅ Added hook usage for {city_display}")
    
    # 3. Update first CTA phone number (hero section)
    cta1_pattern = r'<a href="tel:\+16045551234" className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center">\s*<FaPhone className="mr-2" />\s*\(604\) 555-1234\s*</a>'
    cta1_replacement = '<a href={phoneLoading ? "#" : phoneHref} className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center">\n                <FaPhone className="mr-2" />\n                {phoneLoading ? "Loading..." : phoneDisplay}\n              </a>'
    
    content = re.sub(cta1_pattern, cta1_replacement, content)
    print(f"  ✅ Updated first CTA phone number")
    
    # 4. Update second CTA phone number (bottom section)
    cta2_pattern = r'<a href="tel:\+16045551234" className="btn-outline border-white text-white hover:bg-primary-700 text-lg px-8 py-4 flex items-center justify-center">\s*<FaPhone className="mr-2" />\s*Call \(604\) 555-1234\s*</a>'
    cta2_replacement = '<a href={phoneLoading ? "#" : phoneHref} className="btn-outline border-white text-white hover:bg-primary-700 text-lg px-8 py-4 flex items-center justify-center">\n                <FaPhone className="mr-2" />\n                {phoneLoading ? "Loading..." : phoneDisplay}\n              </a>'
    
    content = re.sub(cta2_pattern, cta2_replacement, content)
    print(f"  ✅ Updated second CTA phone number")
    
    # 5. Update Schema markup telephone field
    schema_pattern = r'"telephone": "\(604\) 555-1234",'
    schema_replacement = r'"telephone": phoneLoading ? "(604) 555-1234" : phoneDisplay.replace(/[^\d+]/g, \'\'),'
    
    content = re.sub(schema_pattern, schema_replacement, content)
    print(f"  ✅ Updated Schema markup telephone field")
    
    # Write the updated content back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"  ✅ Successfully updated {file_path}")
    return True

def main():
    print("🚀 Starting phone number update for remaining static city pages...")
    print("=" * 60)
    
    success_count = 0
    total_files = len(FILES_TO_UPDATE)
    
    for file_info in FILES_TO_UPDATE:
        print(f"\n📄 Processing: {file_info['city_display']}")
        print("-" * 40)
        
        if update_file(file_info):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Summary: {success_count}/{total_files} files updated successfully")
    
    if success_count == total_files:
        print("✅ All files updated successfully!")
    else:
        print(f"⚠️  {total_files - success_count} files failed to update")
    
    return success_count == total_files

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)