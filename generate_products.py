#!/usr/bin/env python3
"""
Generate products.ts from Excel catalog and copy product images.
"""
import os
import shutil
import json
import re
import glob

SRC_IMG = "/Users/shuozhang/Desktop/电视支架/图片"
DST_IMG = "/Users/shuozhang/tv-mount-store/public/images/products"
OUTPUT_TS = "/Users/shuozhang/tv-mount-store/src/data/products.ts"

# ============================================================
# Product definitions parsed from Excel
# ============================================================
# Each tuple: (model, name_en, category, tv_size, vesa, thickness, img_folder, price, original_price, badge, description_extra)

products_raw = [
    # === Fixed / Integrated Mounts (一体架) ===
    ("HT-101", "HT-101 Slim Fixed Mount", "fixed", '14"-42"', "200x200", "0.7-1.2mm", "2.HT-101小一体", 15.99, 24.99, "Best Seller", "Ultra-compact integrated design"),
    ("HT-102N", "HT-102 Medium Fixed Mount (Narrow)", "fixed", '26"-63"', "400x400", "0.8-1.2mm", "3.HT-102中一体", 19.99, 29.99, None, "Narrow plate design for medium TVs"),
    ("HT-102W", "HT-102 Medium Fixed Mount (Wide)", "fixed", '26"-63"', "400x400", "1.0-1.2mm", "宽版中一体", 22.99, 32.99, None, "Wide plate for extra stability"),
    ("HT-S103", "HT-S103 Large Fixed Mount (Narrow)", "fixed", '40"-85"', "600x500", "1.0-1.5mm", "4.HT-s103窄板大一体", 26.99, 39.99, None, "Slim profile for large TVs"),
    ("HT-103", "HT-103 Large Fixed Mount (Wide)", "fixed", '40"-80"', "600x500", "1.0-1.5mm", "5.HT-103宽板大一体", 29.99, 42.99, "Best Seller", "Wide plate for maximum support"),
    ("104S", "104S Extra-Large Fixed Mount", "fixed", '46"-100"', "700x500", "1.5mm", "6.104s", 34.99, 49.99, None, "Heavy-duty for oversized TVs"),
    ("HT-104", "HT-104 Heavy-Duty Fixed Mount", "fixed", '70"-120"', "700x600", "2.0mm", "7.HT-104新一体机加厚臂架", 49.99, 69.99, "New", "Reinforced arms for massive displays"),
    ("HT-105", "HT-105 Super Heavy-Duty Mount", "fixed", '55"-120"', "800x600", "2.0mm", "8.HT-105", 54.99, 74.99, None, "Extra-large VESA for commercial displays"),
    ("HT-106", "HT-106 Max Heavy-Duty Mount", "fixed", '60"-120"', "900x600", "2.0mm", "9.HT-106", 59.99, 79.99, None, "Maximum size support up to 120 inches"),
    ("SH20F", "SH20F Small Fixed Bracket", "fixed", '14"-42"', "200x200", "0.8-1.0mm", "⁯14.SH20F", 12.99, 19.99, None, "Budget-friendly small TV mount"),
    ("SH41F", "SH41F Medium Fixed Bracket", "fixed", '22"-43"', "300x300", "0.8-1.0mm", "20.SH41F", 14.99, 22.99, None, "Compact fixed mount for medium screens"),
    ("SH43F", "SH43F Large Fixed Bracket", "fixed", '26"-60"', "400x400", "1.0-1.5mm", "21.SH43F", 18.99, 27.99, None, "Versatile fixed mount for most TVs"),
    ("SH63F", "SH63F Extra-Large Fixed Bracket", "fixed", '32"-80"', "600x400", "1.0-1.5mm", "22.SH63F固定", 24.99, 36.99, None, "Large VESA pattern support"),
    ("HT-48", "HT-48 Universal Fixed Mount", "fixed", '32"-65"', "500x400", "1.0mm", "23.HT48", 19.99, 29.99, None, "Universal fit for most popular TV sizes"),

    # === Tilt Mounts (上下可调) ===
    ("C35", "C35 Small Tilt Mount", "tilt", '14"-42"', "200x200", "1.0mm", "10.C35", 18.99, 27.99, None, "Compact tilt mount for small TVs"),
    ("C45", "C45 Medium Tilt Mount", "tilt", '26"-55"', "400x400", "1.2mm", "11.C45", 22.99, 34.99, None, "Smooth tilt adjustment for medium TVs"),
    ("C55", "C55 Large Tilt Mount", "tilt", '32"-70"', "600x400", "1.2-1.5mm", "12.C55", 27.99, 39.99, "Best Seller", "Perfect tilt range for large TVs"),
    ("SH20T", "SH20T Small Tilt Bracket", "tilt", '14"-42"', "200x200", "0.8-1.0mm", "15.SH20T", 15.99, 24.99, None, "Lightweight tilt bracket"),
    ("SH42T", "SH42T Medium Tilt Bracket", "tilt", '22"-43"', "300x300", "1.0-1.5mm", "16.SH42T", 19.99, 29.99, None, "Adjustable angle for optimal viewing"),
    ("SH44T", "SH44T Standard Tilt Bracket", "tilt", '26"-60"', "400x400", "1.0-1.5mm", "17.SH44T", 22.99, 32.99, None, "Most popular tilt size range"),
    ("SH64T", "SH64T Large Tilt Bracket", "tilt", '32"-70"', "600x400", "1.0-1.5mm", "18.SH64T", 26.99, 39.99, None, "Large format tilt bracket"),
    ("70T", "70T Heavy-Duty Tilt Mount", "tilt", '40"-86"', "700x500", "1.5mm", "70T", 34.99, 49.99, "New", "Heavy-duty for extra-large screens"),
    ("75T", "75T Super Tilt Mount", "tilt", '42"-90"', "700x500", "2.0mm", "19.75T大尺寸", 39.99, 54.99, None, "Maximum tilt capacity for huge TVs"),
    ("HT-A48", "HT-A48 Adjustable Mount", "tilt", '32"-65"', "500x400", "1.0mm", "24.HTA48", 24.99, 36.99, None, "Versatile adjustable wall mount"),

    # === Full Motion / Articulating (伸缩/摇摆) ===
    ("SH34P", "SH34P Small Articulating Mount", "full-motion", '14"-43"', "200x200", "1.5/1.0mm", "29.SH34P伸缩支架", 29.99, 44.99, None, "Compact extending arm for small TVs"),
    ("SH44P", "SH44P Medium Articulating Mount", "full-motion", '23"-60"', "480x400", "1.5/1.2mm", "30.SH44P伸缩支架", 36.99, 52.99, None, "Full extension for medium TVs"),
    ("CP402", "CP402 Dual-Arm Swivel Mount", "full-motion", '26"-65"', "400x400", "1.8/1.5mm", "CP302、CP402", 44.99, 64.99, None, "Professional dual-arm articulating"),
    ("CP502", "CP502 Large Dual-Arm Mount", "full-motion", '32"-85"', "600x400", "1.8/1.5mm", "32.CP502双臂摇摆", 54.99, 79.99, "Best Seller", "Premium dual-arm for large TVs"),
    ("HT-180P", "HT-180P Single-Arm Swivel", "full-motion", '23"-60"', "400x400", "1.8/1.5mm", "33.HT-180P、360P", 39.99, 56.99, None, "Welded single-arm construction"),
    ("HT-360P", "HT-360P Dual-Arm Swivel", "full-motion", '23"-60"', "400x400", "1.8/1.5mm", "33.HT-180P、360P", 46.99, 66.99, None, "Welded dual-arm for extra reach"),
    ("HT-540P", "HT-540P Large Single-Arm", "full-motion", '32"-70"', "600x400", "1.8/1.5mm", "35.540P单臂摇摆", 49.99, 69.99, None, "Heavy single-arm for large TVs"),
    ("HT-720P", "HT-720P Large Dual-Arm", "full-motion", '32"-80"', "600x400", "1.8/1.5mm", "36.HT-720P双臂摇摆", 56.99, 79.99, "New", "Premium dual-arm for extra-large TVs"),
    ("CP201", "CP201 Compact Extending Mount", "full-motion", '14"-42"', "200x200", "1.5/1.2mm", "38.CP201伸缩支架", 32.99, 47.99, None, "Space-saving extending design"),
    ("HT-304E", "HT-304E Upgraded Swivel Mount", "full-motion", '14"-42"', "200x200", "1.5mm", "40.303E、304E、305E", 28.99, 42.99, None, "Upgraded design with smooth motion"),
    ("HT-117B-N", "HT-117B Narrow Wall Plate Swivel", "full-motion", '14"-42"', "200x200", "1.2mm", "41.HT-117B(CP302)窄墙板", 34.99, 49.99, None, "Narrow wall plate saves space"),
    ("HT-117B2-N", "HT-117B-2 Narrow Wall Plate", "full-motion", '14"-42"', "200x200", "1.2mm", "42.HT-117B-2窄墙板", 36.99, 52.99, None, "Enhanced narrow plate design"),
    ("HT-117B-W", "HT-117B Wide Wall Plate Swivel", "full-motion", '14"-55"', "400x400", "1.2mm", "43.HT-117B(303E)宽墙板", 38.99, 54.99, None, "Wide plate for larger TVs"),
    ("HT-117B2-W", "HT-117B-2 Wide Wall Plate", "full-motion", '14"-55"', "400x400", "1.2mm", "44.Ht-117B-2(305E)宽墙板", 39.99, 56.99, None, "Enhanced wide plate design"),
    ("X200", "X200 Premium Small Swivel", "full-motion", '17"-42"', "200x200", "1.5mm", "45.X200", 36.99, 52.99, None, "Premium build quality small mount"),
    ("X400", "X400 Premium Medium Swivel", "full-motion", '32"-55"', "400x400", "1.5mm", "46.X400", 42.99, 59.99, None, "Premium build for medium TVs"),
    ("HT-814", "HT-814 Full Motion Mount", "full-motion", '26"-55"', "400x400", "1.5/1.2mm", "47.HT-814(P1105)", 38.99, 54.99, None, "Smooth full-motion articulation"),
    ("E4", "E4 Rotating Portrait/Landscape Mount", "full-motion", '32"-60"', "400x400", "2.0/1.5mm", "49.E4", 59.99, 84.99, "New", "90-degree rotation for portrait mode"),
    ("P4", "P4 Swivel Arm Mount", "full-motion", '32"-55"', "400x400", "standard", "50.P4", 44.99, 64.99, None, "Reliable swivel arm design"),
    ("P5", "P5 Extended Reach Mount", "full-motion", '32"-60"', "400x400", "standard", None, 49.99, 69.99, None, "Extra extension reach"),
    ("P6", "P6 Heavy-Duty Swivel Mount", "full-motion", '40"-80"', "600x400", "standard", None, 59.99, 84.99, None, "Heavy-duty for large screens"),
    ("757-L400", "757-L400 Professional Arm", "full-motion", '32"-70"', "400x400", "standard", None, 64.99, 89.99, None, "Professional-grade articulating arm"),
    ("767-L600", "767-L600 Professional Large Arm", "full-motion", '40"-75"', "600x400", "standard", None, 74.99, 99.99, None, "Professional arm for large displays"),
    ("HT-001", "HT-001 Basic Wall Mount", "full-motion", '15"-42"', "300x300", "0.8-1.0mm", "25.HT001", 16.99, 24.99, None, "Entry-level wall mount"),
    ("HT-002", "HT-002 Standard Wall Mount", "full-motion", '32"-55"', "400x400", "0.8-1.0mm", "26.HT002或P1102", 19.99, 29.99, None, "Standard wall mount for most TVs"),
    ("HT-003", "HT-003 Large Wall Mount", "full-motion", '32"-70"', "600x400", "1.0-1.2mm", "28.NBD2-F", 24.99, 36.99, None, "Large format wall mount"),

    # === Monitor Arms (大方管/显示器支架) ===
    ("CP102", "CP102 Monitor Arm", "desk", '10"-32"', "100x100", "1.5/1.2mm", "37.CP102大方管", 29.99, 42.99, None, "Sturdy monitor arm for desk setup"),
    ("CP103", "CP103 Monitor Arm Pro", "desk", '14"-32"', "100x100", "1.5/1.2mm", "39.CP103大方管", 34.99, 49.99, None, "Professional monitor arm with extension"),
    ("HT-805", "HT-805 Display Monitor Mount", "desk", '14"-27"', "100x100", "1.2mm", "48.HT-805", 24.99, 36.99, None, "Compact monitor mount for small screens"),

    # === TV Stands (底座) ===
    ("D300", "D300 Steel Table Stand (Small)", "stand", '32"-37"', "/", "2.0mm", None, 29.99, 42.99, None, "All-steel construction tabletop stand"),
    ("D500", "D500 Steel Table Stand (Large)", "stand", '37"-75"', "/", "2.0mm", None, 39.99, 56.99, None, "Large steel tabletop stand"),
    ("HT-006", "HT-006 Tabletop Stand", "stand", '26"-32"', "400x400", "1.2mm", None, 24.99, 36.99, None, "Compact tabletop TV stand"),
    ("HT-007", "HT-007 Large Tabletop Stand", "stand", '37"-55"', "600x400", "1.5mm", None, 34.99, 49.99, None, "Large format tabletop TV stand"),

    # === Ceiling Mounts (吊架) ===
    ("HT-806", "HT-806 Small Ceiling Mount", "ceiling", '14"-32"', "200x200", "1.6/1.2mm", None, 34.99, 49.99, None, "Compact ceiling mount with swivel"),
    ("HT-807", "HT-807 Medium Ceiling Mount", "ceiling", '26"-60"', "400x400", "1.6/1.2mm", "51.HT807中吊架", 44.99, 64.99, "Best Seller", "Adjustable height ceiling mount"),
    ("HT-807-1", "HT-807-1 Large Ceiling Mount", "ceiling", '32"-70"', "600x400", "1.5/1.7mm", None, 49.99, 69.99, None, "Large format ceiling mount"),
    ("HT-808", "HT-808 Heavy-Duty Ceiling Mount", "ceiling", '42"-80"', "700x400", "2.0/1.5mm", None, 59.99, 84.99, "New", "Heavy-duty for commercial use"),
    ("NBT560-15", "NBT560-15 Premium Ceiling Mount", "ceiling", '32"-70"', "600x400", "1.8mm", None, 54.99, 74.99, None, "Premium construction ceiling bracket"),

    # === Set-Top Box Mounts (机顶盒) ===
    ("HT-Q08", "HT-Q08 Set-Top Box Mount", "accessory", None, "350x250", "1.5/1.0mm", "Q08大", 9.99, 14.99, None, "Wall mount for cable boxes and routers"),
    ("HT-Q09", "HT-Q09 Floating Shelf Mount", "accessory", None, None, "1.2mm", None, 12.99, 18.99, None, "Floating shelf for media devices"),
    ("HT-Q10", "HT-Q10 Universal Device Mount", "accessory", None, "320x220", "standard", None, 11.99, 16.99, None, "Universal mount for set-top boxes"),
    ("SPS-502", "SPS-502 Speaker Stand (Pair)", "accessory", None, None, "standard", "60.SPS502音响支架", 39.99, 56.99, None, "Adjustable speaker floor stands"),

    # === Mobile Carts (推车) ===
    ("1500", "1500 Mobile TV Cart", "cart", '32"-65"', "600x400", "1.5mm", "52.1500推车", 89.99, 129.99, "Best Seller", "Classic rolling TV stand"),
    ("1500-EXT", "1500 Telescoping Mobile Cart", "cart", '32"-70"', "600x400", "1.5mm", "53.1500推车新款伸缩款", 99.99, 139.99, None, "Height-adjustable telescoping cart"),
    ("Y-1600", "Y-1600 Rotating Mobile Cart", "cart", '32"-70"', "600x400", "1.5mm", "54.Y16001700旋转推车新旋转90度", 109.99, 149.99, "New", "90-degree rotating mobile stand"),
    ("Y-1900", "Y-1900 Heavy Rotating Cart", "cart", '32"-80"', "600x480", "1.5mm", "55.Y1900推车新款旋转90度", 119.99, 159.99, None, "Heavy-duty rotating mobile stand"),
    ("1700-ECO", "1700 Economy Mobile Cart", "cart", '32"-70"', "600x400", "1.2mm", "56.1700推车窄经济", 79.99, 109.99, None, "Budget-friendly rolling stand"),
    ("1700-W", "1700 Wide Mobile Cart", "cart", '32"-70"', "600x400", "1.5mm", "57.1700宽推车", 94.99, 129.99, None, "Extra-wide base for stability"),
    ("1800S", "1800S Heavy-Duty Cart", "cart", '60"-100"', "900x600", "2.0mm", "58.1800推车", 149.99, 199.99, None, "Commercial-grade for massive displays"),
    ("2100", "2100 Professional Cart", "cart", '60"-120"', "1000x600", "2.5mm", "59.2100推车", 199.99, 279.99, None, "Professional mobile stand for digital signage"),
]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def find_images(folder_name):
    """Find all images in a product folder"""
    if not folder_name:
        return []
    folder_path = os.path.join(SRC_IMG, folder_name)
    if not os.path.isdir(folder_path):
        return []
    exts = ('*.jpg', '*.jpeg', '*.png', '*.webp', '*.JPG', '*.JPEG', '*.PNG', '*.WEBP')
    images = []
    for ext in exts:
        images.extend(glob.glob(os.path.join(folder_path, '**', ext), recursive=True))
    # deduplicate (case-insensitive match)
    seen = set()
    unique = []
    for img in sorted(images):
        lower = img.lower()
        if lower not in seen:
            seen.add(lower)
            unique.append(img)
    return sorted(unique)[:4]  # max 4 images per product

def copy_images():
    """Copy product images to public folder, return mapping"""
    os.makedirs(DST_IMG, exist_ok=True)
    image_map = {}  # model -> [relative paths]

    for p in products_raw:
        model = p[0]
        folder = p[7] if len(p) > 7 else None
        # folder is at index 6
        folder = p[6]
        slug = slugify(p[1])
        images = find_images(folder)

        dst_paths = []
        for i, src_path in enumerate(images):
            ext = os.path.splitext(src_path)[1].lower()
            if ext == '.jpeg':
                ext = '.jpg'
            dst_name = f"{slug}-{i+1}{ext}"
            dst_path = os.path.join(DST_IMG, dst_name)
            shutil.copy2(src_path, dst_path)
            dst_paths.append(f"/images/products/{dst_name}")

        image_map[model] = dst_paths

    return image_map

def generate_ts(image_map):
    """Generate the products.ts TypeScript file"""

    lines = []
    lines.append("export interface Product {")
    lines.append("  id: string")
    lines.append("  name: string")
    lines.append("  slug: string")
    lines.append("  category: 'fixed' | 'tilt' | 'full-motion' | 'ceiling' | 'desk' | 'stand' | 'cart' | 'accessory'")
    lines.append("  price: number")
    lines.append("  originalPrice?: number")
    lines.append("  rating: number")
    lines.append("  reviewCount: number")
    lines.append("  images: string[]")
    lines.append("  description: string")
    lines.append("  features: string[]")
    lines.append("  specs: Record<string, string>")
    lines.append("  badge?: 'Best Seller' | 'New' | 'Sale'")
    lines.append("  inStock: boolean")
    lines.append("}")
    lines.append("")
    lines.append("export interface Category {")
    lines.append("  id: string")
    lines.append("  name: string")
    lines.append("  slug: string")
    lines.append("  description: string")
    lines.append("  icon: string")
    lines.append("  count: number")
    lines.append("}")
    lines.append("")

    # Count products per category
    cat_counts = {}
    for p in products_raw:
        cat = p[2]
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    lines.append("export const categories: Category[] = [")
    cats = [
        ("1", "Fixed Mounts", "fixed", "Low-profile, flush-to-wall design", "📐"),
        ("2", "Tilt Mounts", "tilt", "Adjustable vertical angle for glare reduction", "📺"),
        ("3", "Full Motion", "full-motion", "Extend, swivel, and tilt for maximum flexibility", "🔄"),
        ("4", "Ceiling Mounts", "ceiling", "Hang your TV from the ceiling", "🏗️"),
        ("5", "Monitor Arms", "desk", "Monitor arms for desk setups", "🖥️"),
        ("6", "TV Stands", "stand", "Tabletop stands for any surface", "🗄️"),
        ("7", "Mobile Carts", "cart", "Rolling TV stands for flexible placement", "🛒"),
        ("8", "Accessories", "accessory", "Set-top box mounts, speaker stands & more", "🔧"),
    ]
    for cid, name, slug, desc, icon in cats:
        count = cat_counts.get(slug, 0)
        lines.append(f"  {{ id: '{cid}', name: '{name}', slug: '{slug}', description: '{desc}', icon: '{icon}', count: {count} }},")
    lines.append("]")
    lines.append("")

    # Features by category
    cat_features = {
        "fixed": [
            "Ultra-slim wall profile",
            "Heavy-duty steel construction",
            "Built-in bubble level for easy alignment",
            "All mounting hardware included",
            "Universal VESA compatibility",
            "10-year warranty",
        ],
        "tilt": [
            "Adjustable tilt angle for optimal viewing",
            "Reduce screen glare with angle control",
            "Heavy-duty steel construction",
            "Quick-release locking mechanism",
            "All mounting hardware included",
            "10-year warranty",
        ],
        "full-motion": [
            "Full motion: extend, swivel, and tilt",
            "Heavy-duty steel construction",
            "Smooth adjustment mechanism",
            "Integrated cable management",
            "All mounting hardware included",
            "10-year warranty",
        ],
        "ceiling": [
            "Adjustable drop height",
            "360-degree rotation",
            "Tilt adjustment for perfect angle",
            "Clean cable routing through pole",
            "Heavy-duty construction",
            "All mounting hardware included",
        ],
        "desk": [
            "C-clamp and grommet mounting options",
            "Full range of motion adjustment",
            "Integrated cable management",
            "Sturdy steel construction",
            "Easy installation",
        ],
        "stand": [
            "Sturdy steel base construction",
            "Non-slip padding protects surfaces",
            "Easy assembly in minutes",
            "Universal VESA compatibility",
            "Weighted base for stability",
        ],
        "cart": [
            "Locking caster wheels for safety",
            "Height adjustable",
            "Built-in cable management",
            "Sturdy steel construction",
            "Easy assembly",
            "Universal VESA compatibility",
        ],
        "accessory": [
            "Easy wall installation",
            "Sturdy construction",
            "Universal compatibility",
            "All hardware included",
        ],
    }

    lines.append("export const products: Product[] = [")

    import random
    random.seed(42)  # consistent ratings

    for i, p in enumerate(products_raw):
        model, name, cat, tv_size, vesa, thickness, folder, price, orig_price, badge, desc_extra = p
        slug = slugify(name)
        pid = f"mp-{i+1:03d}"
        images = image_map.get(model, [])
        rating = round(random.uniform(4.3, 4.9), 1)
        reviews = random.randint(200, 5000)
        features = cat_features.get(cat, [])

        # Build description
        desc_parts = [desc_extra + "."]
        if tv_size:
            desc_parts.append(f"Fits {tv_size} TVs.")
        if vesa and vesa != "/":
            desc_parts.append(f"Universal VESA pattern up to {vesa}mm.")
        desc_parts.append("Heavy-duty steel construction with premium powder-coated finish. Complete hardware kit included for quick DIY installation.")
        description = " ".join(desc_parts)

        # Build specs
        specs = {}
        if tv_size:
            specs["TV Size"] = tv_size
        if vesa and vesa != "/":
            specs["VESA Pattern"] = f"Up to {vesa} mm"
        specs["Material Thickness"] = thickness
        specs["Material"] = "Heavy-duty steel"
        specs["Color"] = "Black"
        specs["Warranty"] = "10 Years"

        # Format images array
        img_strs = ", ".join([f"'{im}'" for im in images])

        badge_str = f"'{badge}'" if badge else "undefined"

        lines.append("  {")
        lines.append(f"    id: '{pid}',")
        lines.append(f"    name: '{name}',")
        lines.append(f"    slug: '{slug}',")
        lines.append(f"    category: '{cat}',")
        lines.append(f"    price: {price},")
        lines.append(f"    originalPrice: {orig_price},")
        lines.append(f"    rating: {rating},")
        lines.append(f"    reviewCount: {reviews},")
        lines.append(f"    images: [{img_strs}],")

        # Escape description for TS
        safe_desc = description.replace("'", "\\'")
        lines.append(f"    description: '{safe_desc}',")

        # Features
        lines.append("    features: [")
        for feat in features:
            safe_feat = feat.replace("'", "\\'")
            lines.append(f"      '{safe_feat}',")
        lines.append("    ],")

        # Specs
        lines.append("    specs: {")
        for sk, sv in specs.items():
            safe_sv = sv.replace("'", "\\'")
            lines.append(f"      '{sk}': '{safe_sv}',")
        lines.append("    },")

        if badge:
            lines.append(f"    badge: '{badge}',")
        lines.append("    inStock: true,")
        lines.append("  },")

    lines.append("]")
    lines.append("")

    # Helper functions
    lines.append("export function getProductBySlug(slug: string): Product | undefined {")
    lines.append("  return products.find(p => p.slug === slug)")
    lines.append("}")
    lines.append("")
    lines.append("export function getProductsByCategory(category: string): Product[] {")
    lines.append("  return products.filter(p => p.category === category)")
    lines.append("}")
    lines.append("")
    lines.append("export function getFeaturedProducts(): Product[] {")
    lines.append("  return products.filter(p => p.badge === 'Best Seller')")
    lines.append("}")
    lines.append("")

    with open(OUTPUT_TS, 'w') as f:
        f.write('\n'.join(lines))

    print(f"Generated {OUTPUT_TS} with {len(products_raw)} products")

if __name__ == '__main__':
    print("Copying images...")
    image_map = copy_images()
    total_images = sum(len(v) for v in image_map.values())
    print(f"Copied {total_images} images")

    print("Generating products.ts...")
    generate_ts(image_map)
    print("Done!")
