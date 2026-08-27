from PIL import Image

# Open the uploaded image
img_path = r"C:/Users/ASUS/.gemini/antigravity-ide/brain/tempmediaStorage/media__1780910144951.png"
img = Image.open(img_path)
width, height = img.size
print(f"Image dimensions: {width}x{height}")

# Let's crop the image. It contains two logos stacked vertically.
# We will inspect where to crop. Let's crop top half and bottom half first.
# Or we can scan for horizontal lines of fully transparent/white pixels to find the gap.

# Convert to RGBA
img_rgba = img.convert("RGBA")

# Let's find rows with very little color or just white/transparent to locate the separation point.
# The background looks white.
import numpy as np
data = np.array(img_rgba)

# We want to find a row index that is mostly white/transparent.
# Let's check each row to see if it's blank (either transparent alpha=0 or white R=255, G=255, B=255)
is_row_blank = []
for y in range(height):
    row = data[y]
    # Check if all pixels in the row are close to white (e.g. R>250, G>250, B>250) or alpha close to 0
    blank_pixels = 0
    for x in range(width):
        r, g, b, a = row[x]
        if a < 10 or (r > 245 and g > 245 and b > 245):
            blank_pixels += 1
    is_row_blank.append(blank_pixels == width)

# Let's find the longest run of blank rows in the middle section (e.g., between 35% and 65% of height)
mid_start = int(height * 0.35)
mid_end = int(height * 0.65)
blank_in_middle = [y for y in range(mid_start, mid_end) if is_row_blank[y]]

if blank_in_middle:
    split_y = blank_in_middle[len(blank_in_middle) // 2]
    print(f"Automatically detected split at y={split_y}")
else:
    split_y = height // 2
    print(f"Could not automatically detect split, using middle: y={split_y}")

# Crop RS Nusantara (Top)
rs_nusantara = img.crop((0, 0, width, split_y))
# Crop Bali International Hospital (Bottom)
bali_hospital = img.crop((0, split_y, width, height))

# Let's trim whitespace for both cropped images
def trim(im):
    # Trim white/transparent borders
    bg = Image.new(im.mode, im.size, (255, 255, 255, 255) if im.mode == "RGBA" else im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

from PIL import ImageChops
try:
    rs_nusantara_trimmed = trim(rs_nusantara)
    bali_hospital_trimmed = trim(bali_hospital)
except Exception as e:
    print(f"Error during trim: {e}")
    rs_nusantara_trimmed = rs_nusantara
    bali_hospital_trimmed = bali_hospital

# Save the images
rs_nusantara_trimmed.save(r"e:/Fani/Semester Kerja/DPSA/webDPSA/public/images/client/RS Nusantara.png")
bali_hospital_trimmed.save(r"e:/Fani/Semester Kerja/DPSA/webDPSA/public/images/client/Bali International Hospital.png")
print("Saved successfully!")
