import re
file_path = "src/components/AddressAutocomplete.tsx"
with open(file_path, "r") as file:
    content = file.read()
content = content.replace("const addressParts = suggestion.address.split(\", \");", "// Check if address is an object or string
      let addressParts = [];
      if (typeof suggestion.address === \"object\" && suggestion.address !== null) {
        // Handle object address
        const addr = suggestion.address;
        addressParts = [addr.road || \"\", addr.city || \"\"];
      } else if (typeof suggestion.address === \"string\") {
        // Handle string address
        addressParts = suggestion.address.split(\", \");
      } else {
        // Fallback to display_name
        const displayAddress = suggestion.display_name || \"\";
        addressParts = displayAddress.split(\", \");
      }")
with open(file_path, "w") as file:
    file.write(content)
print("Fix applied successfully!")
