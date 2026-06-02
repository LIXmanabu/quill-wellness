// Per-serving macro values. Values are approximate, per standard serving.
// kcal, protein (g), carbs (g), fat (g), fibre (g)

export const foods = [
  // ─── Proteins ─────────────────────────────────────────────────
  { id: 'chicken-breast', name: 'Chicken breast', serving: '150 g', kcal: 248, p: 46, c: 0, f: 5, fib: 0, cat: 'protein' },
  { id: 'chicken-thigh', name: 'Chicken thigh', serving: '150 g', kcal: 295, p: 38, c: 0, f: 16, fib: 0, cat: 'protein' },
  { id: 'turkey-breast', name: 'Turkey breast', serving: '150 g', kcal: 220, p: 45, c: 0, f: 3, fib: 0, cat: 'protein' },
  { id: 'salmon', name: 'Salmon fillet', serving: '120 g', kcal: 250, p: 25, c: 0, f: 16, fib: 0, cat: 'protein' },
  { id: 'cod', name: 'Cod fillet', serving: '150 g', kcal: 140, p: 32, c: 0, f: 1, fib: 0, cat: 'protein' },
  { id: 'mackerel', name: 'Mackerel', serving: '120 g', kcal: 260, p: 24, c: 0, f: 18, fib: 0, cat: 'protein' },
  { id: 'shrimp', name: 'Shrimp / prawns', serving: '120 g', kcal: 120, p: 24, c: 1, f: 2, fib: 0, cat: 'protein' },
  { id: 'tuna-can', name: 'Tuna, canned in water', serving: '1 can (140 g)', kcal: 130, p: 28, c: 0, f: 1, fib: 0, cat: 'protein' },
  { id: 'sardines', name: 'Sardines', serving: '1 tin (90 g)', kcal: 200, p: 23, c: 0, f: 11, fib: 0, cat: 'protein' },
  { id: 'eggs-2', name: 'Eggs', serving: '2 large', kcal: 156, p: 13, c: 1, f: 11, fib: 0, cat: 'protein' },
  { id: 'eggs-3', name: 'Eggs (3 large)', serving: '3 large', kcal: 234, p: 19, c: 2, f: 16, fib: 0, cat: 'protein' },
  { id: 'egg-white', name: 'Egg whites', serving: '4 large', kcal: 68, p: 14, c: 1, f: 0, fib: 0, cat: 'protein' },
  { id: 'lean-beef', name: 'Lean beef (sirloin)', serving: '120 g', kcal: 240, p: 30, c: 0, f: 13, fib: 0, cat: 'protein' },
  { id: 'beef-mince', name: 'Beef mince (5% fat)', serving: '150 g', kcal: 215, p: 35, c: 0, f: 8, fib: 0, cat: 'protein' },
  { id: 'pork-chop', name: 'Pork chop, lean', serving: '150 g', kcal: 250, p: 32, c: 0, f: 13, fib: 0, cat: 'protein' },
  { id: 'bacon', name: 'Bacon', serving: '2 rashers', kcal: 130, p: 9, c: 0, f: 10, fib: 0, cat: 'protein' },
  { id: 'ham', name: 'Ham, sliced', serving: '60 g', kcal: 95, p: 14, c: 1, f: 4, fib: 0, cat: 'protein' },
  { id: 'tofu', name: 'Tofu, firm', serving: '120 g', kcal: 145, p: 17, c: 3, f: 8, fib: 2, cat: 'protein' },
  { id: 'tempeh', name: 'Tempeh', serving: '100 g', kcal: 195, p: 20, c: 8, f: 11, fib: 7, cat: 'protein' },
  { id: 'edamame', name: 'Edamame', serving: '100 g', kcal: 122, p: 11, c: 10, f: 5, fib: 5, cat: 'protein' },
  { id: 'greek-yogurt', name: 'Greek yogurt (0%)', serving: '170 g', kcal: 100, p: 17, c: 6, f: 0, fib: 0, cat: 'protein' },
  { id: 'greek-yogurt-5', name: 'Greek yogurt (5%)', serving: '170 g', kcal: 155, p: 16, c: 6, f: 7, fib: 0, cat: 'protein' },
  { id: 'skyr', name: 'Skyr', serving: '170 g', kcal: 105, p: 18, c: 7, f: 0, fib: 0, cat: 'protein' },
  { id: 'cottage-cheese', name: 'Cottage cheese', serving: '120 g', kcal: 110, p: 14, c: 4, f: 4, fib: 0, cat: 'protein' },
  { id: 'whey', name: 'Whey or pea protein', serving: '1 scoop', kcal: 120, p: 24, c: 3, f: 1, fib: 0, cat: 'protein' },
  { id: 'lentils', name: 'Lentils, cooked', serving: '1 cup', kcal: 230, p: 18, c: 40, f: 1, fib: 16, cat: 'protein' },
  { id: 'chickpeas', name: 'Chickpeas, cooked', serving: '1 cup', kcal: 270, p: 15, c: 45, f: 4, fib: 12, cat: 'protein' },
  { id: 'black-beans', name: 'Black beans', serving: '1 cup', kcal: 220, p: 15, c: 40, f: 1, fib: 15, cat: 'protein' },
  { id: 'kidney-beans', name: 'Kidney beans', serving: '1 cup', kcal: 215, p: 15, c: 40, f: 1, fib: 13, cat: 'protein' },
  { id: 'protein-bar', name: 'Protein bar', serving: '1 bar (60 g)', kcal: 220, p: 20, c: 22, f: 7, fib: 4, cat: 'protein' },

  // ─── Grains & starches ────────────────────────────────────────
  { id: 'oats', name: 'Rolled oats, dry', serving: '50 g', kcal: 190, p: 7, c: 33, f: 3, fib: 5, cat: 'carb' },
  { id: 'granola', name: 'Granola', serving: '50 g', kcal: 230, p: 5, c: 30, f: 10, fib: 4, cat: 'carb' },
  { id: 'muesli', name: 'Muesli', serving: '50 g', kcal: 180, p: 6, c: 32, f: 3, fib: 5, cat: 'carb' },
  { id: 'cereal-flakes', name: 'Corn / bran flakes', serving: '40 g', kcal: 150, p: 4, c: 32, f: 1, fib: 3, cat: 'carb' },
  { id: 'brown-rice', name: 'Brown rice, cooked', serving: '1 cup', kcal: 215, p: 5, c: 45, f: 2, fib: 4, cat: 'carb' },
  { id: 'white-rice', name: 'White rice, cooked', serving: '1 cup', kcal: 205, p: 4, c: 45, f: 0, fib: 1, cat: 'carb' },
  { id: 'jasmine-rice', name: 'Jasmine rice', serving: '1 cup', kcal: 200, p: 4, c: 45, f: 0, fib: 1, cat: 'carb' },
  { id: 'quinoa', name: 'Quinoa, cooked', serving: '1 cup', kcal: 220, p: 8, c: 39, f: 4, fib: 5, cat: 'carb' },
  { id: 'couscous', name: 'Couscous, cooked', serving: '1 cup', kcal: 175, p: 6, c: 36, f: 0, fib: 2, cat: 'carb' },
  { id: 'bulgur', name: 'Bulgur, cooked', serving: '1 cup', kcal: 150, p: 6, c: 34, f: 0, fib: 8, cat: 'carb' },
  { id: 'barley', name: 'Barley, cooked', serving: '1 cup', kcal: 190, p: 4, c: 44, f: 1, fib: 6, cat: 'carb' },
  { id: 'pasta-whole', name: 'Wholemeal pasta', serving: '80 g dry', kcal: 280, p: 12, c: 56, f: 2, fib: 7, cat: 'carb' },
  { id: 'pasta-white', name: 'White pasta', serving: '80 g dry', kcal: 285, p: 10, c: 58, f: 1, fib: 3, cat: 'carb' },
  { id: 'ramen', name: 'Ramen noodles', serving: '1 portion', kcal: 380, p: 8, c: 54, f: 14, fib: 2, cat: 'carb' },
  { id: 'soba', name: 'Soba noodles', serving: '1 cup', kcal: 113, p: 6, c: 24, f: 0, fib: 1, cat: 'carb' },
  { id: 'sweet-potato', name: 'Sweet potato, baked', serving: '200 g', kcal: 180, p: 4, c: 41, f: 0, fib: 7, cat: 'carb' },
  { id: 'potato', name: 'Potato, boiled', serving: '200 g', kcal: 175, p: 4, c: 40, f: 0, fib: 4, cat: 'carb' },
  { id: 'mashed-potato', name: 'Mashed potato', serving: '200 g', kcal: 175, p: 3, c: 30, f: 5, fib: 3, cat: 'carb' },
  { id: 'fries', name: 'Fries / chips', serving: '150 g', kcal: 440, p: 5, c: 55, f: 22, fib: 5, cat: 'carb' },
  { id: 'bread-whole', name: 'Wholegrain bread', serving: '2 slices', kcal: 160, p: 8, c: 28, f: 2, fib: 6, cat: 'carb' },
  { id: 'bread-white', name: 'White bread', serving: '2 slices', kcal: 160, p: 5, c: 30, f: 2, fib: 1, cat: 'carb' },
  { id: 'sourdough', name: 'Sourdough', serving: '2 slices', kcal: 180, p: 7, c: 35, f: 1, fib: 2, cat: 'carb' },
  { id: 'tortilla', name: 'Wholewheat tortilla', serving: '1 large', kcal: 140, p: 5, c: 22, f: 4, fib: 4, cat: 'carb' },
  { id: 'pita', name: 'Pita bread', serving: '1 large', kcal: 165, p: 5, c: 33, f: 1, fib: 2, cat: 'carb' },
  { id: 'bagel', name: 'Bagel', serving: '1 plain', kcal: 270, p: 11, c: 53, f: 2, fib: 2, cat: 'carb' },
  { id: 'croissant', name: 'Croissant', serving: '1 medium', kcal: 270, p: 5, c: 31, f: 14, fib: 2, cat: 'carb' },
  { id: 'pancake', name: 'Pancakes', serving: '3 medium', kcal: 350, p: 8, c: 50, f: 12, fib: 2, cat: 'carb' },
  { id: 'waffle', name: 'Waffle', serving: '1 large', kcal: 220, p: 6, c: 25, f: 11, fib: 1, cat: 'carb' },
  { id: 'rice-cake', name: 'Rice cakes', serving: '3 cakes', kcal: 105, p: 2, c: 22, f: 1, fib: 1, cat: 'carb' },

  // ─── Vegetables ───────────────────────────────────────────────
  { id: 'spinach', name: 'Spinach, fresh', serving: '100 g', kcal: 23, p: 3, c: 4, f: 0, fib: 2, cat: 'veg' },
  { id: 'broccoli', name: 'Broccoli', serving: '150 g', kcal: 50, p: 4, c: 10, f: 1, fib: 4, cat: 'veg' },
  { id: 'cauliflower', name: 'Cauliflower', serving: '150 g', kcal: 38, p: 3, c: 8, f: 0, fib: 3, cat: 'veg' },
  { id: 'brussels-sprouts', name: 'Brussels sprouts', serving: '150 g', kcal: 65, p: 5, c: 13, f: 0, fib: 5, cat: 'veg' },
  { id: 'asparagus', name: 'Asparagus', serving: '150 g', kcal: 30, p: 3, c: 6, f: 0, fib: 3, cat: 'veg' },
  { id: 'carrot', name: 'Carrots', serving: '150 g', kcal: 60, p: 1, c: 14, f: 0, fib: 4, cat: 'veg' },
  { id: 'beetroot', name: 'Beetroot', serving: '150 g', kcal: 65, p: 2, c: 14, f: 0, fib: 4, cat: 'veg' },
  { id: 'zucchini', name: 'Zucchini', serving: '150 g', kcal: 25, p: 2, c: 5, f: 0, fib: 2, cat: 'veg' },
  { id: 'eggplant', name: 'Eggplant', serving: '150 g', kcal: 37, p: 1, c: 9, f: 0, fib: 4, cat: 'veg' },
  { id: 'mushrooms', name: 'Mushrooms', serving: '100 g', kcal: 22, p: 3, c: 3, f: 0, fib: 1, cat: 'veg' },
  { id: 'mixed-salad', name: 'Mixed salad leaves', serving: '100 g', kcal: 15, p: 1, c: 3, f: 0, fib: 2, cat: 'veg' },
  { id: 'rocket', name: 'Rocket / arugula', serving: '50 g', kcal: 12, p: 1, c: 2, f: 0, fib: 1, cat: 'veg' },
  { id: 'tomato', name: 'Tomato', serving: '1 medium', kcal: 22, p: 1, c: 5, f: 0, fib: 1, cat: 'veg' },
  { id: 'cherry-tomatoes', name: 'Cherry tomatoes', serving: '100 g', kcal: 20, p: 1, c: 4, f: 0, fib: 1, cat: 'veg' },
  { id: 'cucumber', name: 'Cucumber', serving: '100 g', kcal: 15, p: 1, c: 3, f: 0, fib: 1, cat: 'veg' },
  { id: 'peppers', name: 'Bell peppers', serving: '150 g', kcal: 45, p: 1, c: 9, f: 0, fib: 3, cat: 'veg' },
  { id: 'corn', name: 'Sweet corn', serving: '1 cup', kcal: 130, p: 5, c: 30, f: 2, fib: 4, cat: 'veg' },
  { id: 'peas', name: 'Garden peas', serving: '1 cup', kcal: 115, p: 8, c: 21, f: 0, fib: 7, cat: 'veg' },
  { id: 'roasted-veg', name: 'Roasted veg mix', serving: '200 g', kcal: 120, p: 3, c: 18, f: 5, fib: 5, cat: 'veg' },
  { id: 'kale', name: 'Kale, sautéed', serving: '100 g', kcal: 60, p: 4, c: 7, f: 3, fib: 3, cat: 'veg' },
  { id: 'green-beans', name: 'Green beans', serving: '150 g', kcal: 45, p: 3, c: 9, f: 0, fib: 4, cat: 'veg' },
  { id: 'onion', name: 'Onion', serving: '1 medium', kcal: 45, p: 1, c: 11, f: 0, fib: 2, cat: 'veg' },

  // ─── Fruit ────────────────────────────────────────────────────
  { id: 'banana', name: 'Banana', serving: '1 medium', kcal: 105, p: 1, c: 27, f: 0, fib: 3, cat: 'fruit' },
  { id: 'apple', name: 'Apple', serving: '1 medium', kcal: 95, p: 0, c: 25, f: 0, fib: 4, cat: 'fruit' },
  { id: 'berries', name: 'Mixed berries', serving: '150 g', kcal: 75, p: 1, c: 18, f: 0, fib: 6, cat: 'fruit' },
  { id: 'blueberries', name: 'Blueberries', serving: '150 g', kcal: 85, p: 1, c: 21, f: 0, fib: 4, cat: 'fruit' },
  { id: 'strawberries', name: 'Strawberries', serving: '150 g', kcal: 50, p: 1, c: 12, f: 0, fib: 3, cat: 'fruit' },
  { id: 'raspberries', name: 'Raspberries', serving: '125 g', kcal: 65, p: 2, c: 15, f: 1, fib: 8, cat: 'fruit' },
  { id: 'orange', name: 'Orange', serving: '1 medium', kcal: 70, p: 1, c: 17, f: 0, fib: 3, cat: 'fruit' },
  { id: 'mandarin', name: 'Mandarin / clementine', serving: '2 small', kcal: 70, p: 1, c: 18, f: 0, fib: 3, cat: 'fruit' },
  { id: 'grapes', name: 'Grapes', serving: '150 g', kcal: 105, p: 1, c: 27, f: 0, fib: 1, cat: 'fruit' },
  { id: 'mango', name: 'Mango', serving: '1 cup chunks', kcal: 100, p: 1, c: 25, f: 0, fib: 3, cat: 'fruit' },
  { id: 'pineapple', name: 'Pineapple', serving: '1 cup chunks', kcal: 85, p: 1, c: 22, f: 0, fib: 2, cat: 'fruit' },
  { id: 'peach', name: 'Peach', serving: '1 medium', kcal: 60, p: 1, c: 14, f: 0, fib: 2, cat: 'fruit' },
  { id: 'plum', name: 'Plum', serving: '2 medium', kcal: 60, p: 1, c: 15, f: 0, fib: 2, cat: 'fruit' },
  { id: 'avocado-half', name: 'Avocado', serving: '½ medium', kcal: 160, p: 2, c: 9, f: 15, fib: 7, cat: 'fruit' },
  { id: 'pear', name: 'Pear', serving: '1 medium', kcal: 100, p: 1, c: 27, f: 0, fib: 6, cat: 'fruit' },
  { id: 'kiwi', name: 'Kiwi', serving: '2 medium', kcal: 90, p: 2, c: 22, f: 1, fib: 4, cat: 'fruit' },
  { id: 'watermelon', name: 'Watermelon', serving: '200 g', kcal: 60, p: 1, c: 15, f: 0, fib: 1, cat: 'fruit' },
  { id: 'dates', name: 'Dates', serving: '3 medjool', kcal: 200, p: 2, c: 54, f: 0, fib: 5, cat: 'fruit' },

  // ─── Fats, nuts, dairy ────────────────────────────────────────
  { id: 'olive-oil', name: 'Extra-virgin olive oil', serving: '1 tbsp', kcal: 120, p: 0, c: 0, f: 14, fib: 0, cat: 'fat' },
  { id: 'butter', name: 'Butter', serving: '1 tbsp', kcal: 100, p: 0, c: 0, f: 11, fib: 0, cat: 'fat' },
  { id: 'coconut-oil', name: 'Coconut oil', serving: '1 tbsp', kcal: 115, p: 0, c: 0, f: 13, fib: 0, cat: 'fat' },
  { id: 'almonds', name: 'Almonds', serving: '30 g', kcal: 170, p: 6, c: 6, f: 15, fib: 4, cat: 'fat' },
  { id: 'walnuts', name: 'Walnuts', serving: '30 g', kcal: 185, p: 4, c: 4, f: 18, fib: 2, cat: 'fat' },
  { id: 'cashews', name: 'Cashews', serving: '30 g', kcal: 160, p: 5, c: 9, f: 13, fib: 1, cat: 'fat' },
  { id: 'pistachios', name: 'Pistachios', serving: '30 g', kcal: 170, p: 6, c: 8, f: 14, fib: 3, cat: 'fat' },
  { id: 'peanut-butter', name: 'Peanut butter', serving: '2 tbsp', kcal: 190, p: 8, c: 6, f: 16, fib: 2, cat: 'fat' },
  { id: 'almond-butter', name: 'Almond butter', serving: '2 tbsp', kcal: 195, p: 7, c: 7, f: 18, fib: 3, cat: 'fat' },
  { id: 'chia-seeds', name: 'Chia seeds', serving: '2 tbsp', kcal: 140, p: 5, c: 12, f: 9, fib: 10, cat: 'fat' },
  { id: 'flax-seeds', name: 'Flax seeds', serving: '2 tbsp', kcal: 110, p: 4, c: 6, f: 9, fib: 6, cat: 'fat' },
  { id: 'pumpkin-seeds', name: 'Pumpkin seeds', serving: '30 g', kcal: 160, p: 9, c: 4, f: 14, fib: 2, cat: 'fat' },
  { id: 'hummus', name: 'Hummus', serving: '60 g', kcal: 100, p: 4, c: 8, f: 6, fib: 3, cat: 'fat' },
  { id: 'feta', name: 'Feta cheese', serving: '40 g', kcal: 105, p: 6, c: 2, f: 8, fib: 0, cat: 'dairy' },
  { id: 'cheddar', name: 'Cheddar', serving: '30 g', kcal: 120, p: 7, c: 0, f: 10, fib: 0, cat: 'dairy' },
  { id: 'mozzarella', name: 'Mozzarella', serving: '30 g', kcal: 75, p: 6, c: 1, f: 5, fib: 0, cat: 'dairy' },
  { id: 'parmesan', name: 'Parmesan', serving: '20 g', kcal: 85, p: 8, c: 0, f: 6, fib: 0, cat: 'dairy' },
  { id: 'cream-cheese', name: 'Cream cheese', serving: '30 g', kcal: 100, p: 2, c: 1, f: 10, fib: 0, cat: 'dairy' },
  { id: 'milk', name: 'Milk', serving: '250 ml', kcal: 125, p: 8, c: 12, f: 5, fib: 0, cat: 'dairy' },
  { id: 'oat-milk', name: 'Oat milk', serving: '250 ml', kcal: 120, p: 3, c: 16, f: 5, fib: 2, cat: 'dairy' },
  { id: 'almond-milk', name: 'Almond milk', serving: '250 ml', kcal: 40, p: 1, c: 2, f: 3, fib: 0, cat: 'dairy' },
  { id: 'yogurt-fruit', name: 'Fruit yogurt', serving: '150 g', kcal: 145, p: 6, c: 25, f: 2, fib: 1, cat: 'dairy' },

  // ─── Common composed meals ───────────────────────────────────
  { id: 'salad-bowl', name: 'Big leafy salad bowl', serving: '1 bowl', kcal: 180, p: 6, c: 18, f: 9, fib: 7, cat: 'composed' },
  { id: 'caesar-salad', name: 'Caesar salad with chicken', serving: '1 bowl', kcal: 480, p: 35, c: 18, f: 28, fib: 4, cat: 'composed' },
  { id: 'cobb-salad', name: 'Cobb salad', serving: '1 bowl', kcal: 540, p: 30, c: 14, f: 38, fib: 5, cat: 'composed' },
  { id: 'chicken-rice-bowl', name: 'Chicken + rice + veg bowl', serving: '1 bowl', kcal: 580, p: 45, c: 65, f: 12, fib: 6, cat: 'composed' },
  { id: 'poke-bowl', name: 'Poke bowl (salmon)', serving: '1 bowl', kcal: 540, p: 32, c: 60, f: 18, fib: 5, cat: 'composed' },
  { id: 'burrito-bowl', name: 'Burrito bowl', serving: '1 bowl', kcal: 680, p: 35, c: 80, f: 22, fib: 12, cat: 'composed' },
  { id: 'grain-bowl', name: 'Quinoa grain bowl', serving: '1 bowl', kcal: 520, p: 22, c: 65, f: 18, fib: 10, cat: 'composed' },
  { id: 'pasta-bolognese', name: 'Pasta bolognese', serving: '1 plate', kcal: 620, p: 32, c: 75, f: 18, fib: 6, cat: 'composed' },
  { id: 'pasta-carbonara', name: 'Pasta carbonara', serving: '1 plate', kcal: 720, p: 28, c: 75, f: 32, fib: 4, cat: 'composed' },
  { id: 'pasta-pesto', name: 'Pasta with pesto', serving: '1 plate', kcal: 550, p: 16, c: 65, f: 24, fib: 5, cat: 'composed' },
  { id: 'lasagna', name: 'Lasagna', serving: '1 portion', kcal: 580, p: 28, c: 50, f: 28, fib: 4, cat: 'composed' },
  { id: 'risotto', name: 'Mushroom risotto', serving: '1 plate', kcal: 480, p: 12, c: 70, f: 16, fib: 3, cat: 'composed' },
  { id: 'sushi-roll', name: 'Sushi roll, 8 pieces', serving: '1 roll', kcal: 350, p: 12, c: 60, f: 6, fib: 3, cat: 'composed' },
  { id: 'sashimi', name: 'Sashimi plate', serving: '8 pieces', kcal: 220, p: 35, c: 0, f: 8, fib: 0, cat: 'composed' },
  { id: 'ramen-bowl', name: 'Ramen bowl with pork', serving: '1 bowl', kcal: 600, p: 28, c: 70, f: 22, fib: 4, cat: 'composed' },
  { id: 'pho', name: 'Pho (beef)', serving: '1 bowl', kcal: 380, p: 25, c: 55, f: 6, fib: 3, cat: 'composed' },
  { id: 'curry-chicken', name: 'Chicken curry + rice', serving: '1 plate', kcal: 620, p: 36, c: 65, f: 22, fib: 5, cat: 'composed' },
  { id: 'curry-veg', name: 'Vegetable curry + rice', serving: '1 plate', kcal: 540, p: 16, c: 75, f: 18, fib: 9, cat: 'composed' },
  { id: 'pad-thai', name: 'Pad Thai', serving: '1 plate', kcal: 600, p: 22, c: 80, f: 20, fib: 4, cat: 'composed' },
  { id: 'fried-rice', name: 'Fried rice', serving: '1 plate', kcal: 480, p: 14, c: 60, f: 18, fib: 3, cat: 'composed' },
  { id: 'tacos', name: 'Tacos (3, beef)', serving: '3 tacos', kcal: 560, p: 26, c: 55, f: 24, fib: 8, cat: 'composed' },
  { id: 'burrito', name: 'Burrito', serving: '1 large', kcal: 720, p: 30, c: 90, f: 26, fib: 10, cat: 'composed' },
  { id: 'falafel-wrap', name: 'Falafel wrap', serving: '1 wrap', kcal: 520, p: 18, c: 70, f: 18, fib: 9, cat: 'composed' },
  { id: 'shawarma', name: 'Chicken shawarma plate', serving: '1 plate', kcal: 640, p: 42, c: 60, f: 22, fib: 6, cat: 'composed' },
  { id: 'kebab', name: 'Doner kebab', serving: '1 medium', kcal: 700, p: 32, c: 60, f: 36, fib: 4, cat: 'composed' },
  { id: 'burger-fries', name: 'Burger + fries', serving: '1 meal', kcal: 950, p: 35, c: 90, f: 50, fib: 6, cat: 'composed' },
  { id: 'pizza-slice', name: 'Pizza, 2 slices', serving: '2 slices', kcal: 540, p: 22, c: 65, f: 22, fib: 4, cat: 'composed' },
  { id: 'pizza-margherita', name: 'Pizza margherita (whole)', serving: '1 pizza', kcal: 850, p: 35, c: 110, f: 28, fib: 6, cat: 'composed' },
  { id: 'porridge-bowl', name: 'Porridge + berries + nuts', serving: '1 bowl', kcal: 380, p: 12, c: 55, f: 12, fib: 9, cat: 'composed' },
  { id: 'overnight-oats', name: 'Overnight oats', serving: '1 jar', kcal: 420, p: 18, c: 55, f: 14, fib: 8, cat: 'composed' },
  { id: 'avocado-toast', name: 'Avocado toast', serving: '2 slices', kcal: 380, p: 10, c: 36, f: 22, fib: 8, cat: 'composed' },
  { id: 'breakfast-burrito', name: 'Breakfast burrito', serving: '1 wrap', kcal: 560, p: 28, c: 50, f: 26, fib: 5, cat: 'composed' },
  { id: 'eggs-benedict', name: 'Eggs benedict', serving: '1 plate', kcal: 540, p: 28, c: 30, f: 34, fib: 2, cat: 'composed' },
  { id: 'omelette-veg', name: 'Veggie omelette', serving: '1 (3 eggs)', kcal: 320, p: 22, c: 6, f: 22, fib: 2, cat: 'composed' },
  { id: 'smoothie', name: 'Protein smoothie', serving: '500 ml', kcal: 380, p: 30, c: 45, f: 8, fib: 6, cat: 'composed' },
  { id: 'smoothie-fruit', name: 'Fruit smoothie', serving: '400 ml', kcal: 240, p: 4, c: 55, f: 2, fib: 5, cat: 'composed' },
  { id: 'tuna-sandwich', name: 'Tuna sandwich', serving: '1 sandwich', kcal: 440, p: 32, c: 38, f: 18, fib: 4, cat: 'composed' },
  { id: 'ham-sandwich', name: 'Ham & cheese sandwich', serving: '1 sandwich', kcal: 480, p: 26, c: 42, f: 22, fib: 3, cat: 'composed' },
  { id: 'club-sandwich', name: 'Club sandwich', serving: '1 sandwich', kcal: 620, p: 38, c: 48, f: 30, fib: 4, cat: 'composed' },
  { id: 'dumplings', name: 'Dumplings (6)', serving: '6 pieces', kcal: 380, p: 14, c: 50, f: 12, fib: 2, cat: 'composed' },

  // ─── Drinks ───────────────────────────────────────────────────
  { id: 'water', name: 'Water', serving: '500 ml', kcal: 0, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'coffee-black', name: 'Black coffee', serving: '1 cup', kcal: 5, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'espresso', name: 'Espresso', serving: '1 shot', kcal: 3, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'cappuccino', name: 'Cappuccino', serving: '250 ml', kcal: 120, p: 7, c: 11, f: 5, fib: 0, cat: 'drink' },
  { id: 'latte', name: 'Latte', serving: '350 ml', kcal: 150, p: 8, c: 14, f: 6, fib: 0, cat: 'drink' },
  { id: 'flat-white', name: 'Flat white', serving: '250 ml', kcal: 110, p: 7, c: 10, f: 4, fib: 0, cat: 'drink' },
  { id: 'matcha-latte', name: 'Matcha latte', serving: '350 ml', kcal: 145, p: 8, c: 18, f: 5, fib: 1, cat: 'drink' },
  { id: 'green-tea', name: 'Green tea', serving: '1 cup', kcal: 2, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'black-tea', name: 'Black tea', serving: '1 cup', kcal: 2, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'orange-juice', name: 'Orange juice', serving: '250 ml', kcal: 115, p: 2, c: 26, f: 0, fib: 0, cat: 'drink' },
  { id: 'apple-juice', name: 'Apple juice', serving: '250 ml', kcal: 115, p: 0, c: 28, f: 0, fib: 0, cat: 'drink' },
  { id: 'kombucha', name: 'Kombucha', serving: '330 ml', kcal: 50, p: 0, c: 12, f: 0, fib: 0, cat: 'drink' },
  { id: 'soda', name: 'Soda', serving: '330 ml', kcal: 140, p: 0, c: 39, f: 0, fib: 0, cat: 'drink' },
  { id: 'diet-soda', name: 'Diet soda', serving: '330 ml', kcal: 1, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },
  { id: 'beer', name: 'Beer', serving: '330 ml', kcal: 145, p: 1, c: 11, f: 0, fib: 0, cat: 'drink' },
  { id: 'wine-glass', name: 'Wine', serving: '150 ml', kcal: 125, p: 0, c: 4, f: 0, fib: 0, cat: 'drink' },
  { id: 'spirits', name: 'Spirits (gin / vodka)', serving: '1 shot', kcal: 65, p: 0, c: 0, f: 0, fib: 0, cat: 'drink' },

  // ─── Treats & snacks ──────────────────────────────────────────
  { id: 'dark-chocolate', name: 'Dark chocolate (70%+)', serving: '20 g', kcal: 115, p: 2, c: 9, f: 8, fib: 2, cat: 'treat' },
  { id: 'milk-chocolate', name: 'Milk chocolate', serving: '30 g', kcal: 160, p: 2, c: 17, f: 9, fib: 1, cat: 'treat' },
  { id: 'biscuit', name: 'Biscuit / cookie', serving: '1 medium', kcal: 100, p: 1, c: 14, f: 5, fib: 0, cat: 'treat' },
  { id: 'cookie-large', name: 'Big cookie', serving: '1 large', kcal: 280, p: 3, c: 38, f: 14, fib: 1, cat: 'treat' },
  { id: 'brownie', name: 'Brownie', serving: '1 square', kcal: 250, p: 3, c: 32, f: 13, fib: 1, cat: 'treat' },
  { id: 'donut', name: 'Donut', serving: '1 glazed', kcal: 270, p: 3, c: 31, f: 15, fib: 1, cat: 'treat' },
  { id: 'muffin', name: 'Muffin', serving: '1 large', kcal: 380, p: 6, c: 55, f: 15, fib: 2, cat: 'treat' },
  { id: 'cake-slice', name: 'Cake, slice', serving: '1 slice', kcal: 340, p: 4, c: 50, f: 14, fib: 1, cat: 'treat' },
  { id: 'crisps', name: 'Crisps / chips', serving: '30 g', kcal: 160, p: 2, c: 15, f: 10, fib: 1, cat: 'treat' },
  { id: 'popcorn', name: 'Popcorn (lightly buttered)', serving: '3 cups', kcal: 110, p: 3, c: 18, f: 4, fib: 3, cat: 'treat' },
  { id: 'ice-cream', name: 'Ice cream', serving: '1 scoop', kcal: 140, p: 2, c: 16, f: 7, fib: 0, cat: 'treat' },
  { id: 'gummies', name: 'Gummies', serving: '30 g', kcal: 100, p: 1, c: 24, f: 0, fib: 0, cat: 'treat' },
  { id: 'trail-mix', name: 'Trail mix', serving: '30 g', kcal: 165, p: 4, c: 12, f: 12, fib: 2, cat: 'treat' },
  { id: 'energy-ball', name: 'Energy ball (dates + oats)', serving: '2 balls', kcal: 180, p: 4, c: 26, f: 7, fib: 4, cat: 'treat' },
]

export const categoryStyles = {
  protein: { label: 'Protein', dot: '#3D4A40', bg: '#EAEFEA' },
  carb: { label: 'Grain', dot: '#B08A2E', bg: '#F5EBD0' },
  veg: { label: 'Vegetable', dot: '#5A6B5D', bg: '#D5DDD6' },
  fruit: { label: 'Fruit', dot: '#C8654A', bg: '#F5E1D8' },
  fat: { label: 'Fat / nut', dot: '#9B4423', bg: '#FBEFE9' },
  dairy: { label: 'Dairy', dot: '#8FA694', bg: '#EAEFEA' },
  composed: { label: 'Meal', dot: '#1A1410', bg: '#E8DFD0' },
  drink: { label: 'Drink', dot: '#6B5D52', bg: '#F7F2EA' },
  treat: { label: 'Treat', dot: '#A04E37', bg: '#FBEFE9' },
}

// Daily targets per goal — used to score progress and surface gaps.
export const goalTargets = {
  'fat-loss': { kcal: 1800, p: 130, c: 180, f: 60, fib: 30, label: 'Fat loss' },
  muscle: { kcal: 2800, p: 160, c: 350, f: 80, fib: 30, label: 'Muscle gain' },
  longevity: { kcal: 2200, p: 90, c: 270, f: 75, fib: 35, label: 'Longevity' },
  performance: { kcal: 2600, p: 130, c: 380, f: 70, fib: 30, label: 'Performance' },
  heart: { kcal: 2000, p: 90, c: 240, f: 60, fib: 35, label: 'Heart health' },
  brain: { kcal: 2100, p: 100, c: 240, f: 75, fib: 30, label: 'Brain & focus' },
  balanced: { kcal: 2200, p: 110, c: 270, f: 75, fib: 30, label: 'Balanced' },
}

/**
 * Decide the meal slot based on local time and what's already been logged.
 */
export function currentMealSlot(now = new Date(), logged = []) {
  const h = now.getHours()
  const hasBreakfast = logged.some((m) => m.slot === 'breakfast')
  const hasLunch = logged.some((m) => m.slot === 'lunch')
  const hasDinner = logged.some((m) => m.slot === 'dinner')

  if (h < 11 && !hasBreakfast) return 'breakfast'
  if (h >= 11 && h < 15 && !hasLunch) return 'lunch'
  if (h >= 17 && h < 22 && !hasDinner) return 'dinner'
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h >= 17) return 'dinner'
  return 'snack'
}

const slotLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export function slotLabel(slot) { return slotLabels[slot] || 'Meal' }

/**
 * Suggest the next thing to eat based on:
 *  – the current meal slot
 *  – nutrient gaps vs. the user's daily target
 *  – what's already been eaten today (avoid repeats)
 */
export function suggestNext({ logged, target, now = new Date() }) {
  const slot = currentMealSlot(now, logged)
  const totals = logged.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal * m.servings,
      p: acc.p + m.p * m.servings,
      c: acc.c + m.c * m.servings,
      f: acc.f + m.f * m.servings,
      fib: acc.fib + m.fib * m.servings,
    }),
    { kcal: 0, p: 0, c: 0, f: 0, fib: 0 }
  )

  const gaps = {
    kcal: target.kcal - totals.kcal,
    p: target.p - totals.p,
    c: target.c - totals.c,
    f: target.f - totals.f,
    fib: target.fib - totals.fib,
  }

  // Which macro is most behind (as a % of daily target)
  const ratios = [
    { key: 'p', pct: gaps.p / target.p, label: 'protein' },
    { key: 'fib', pct: gaps.fib / target.fib, label: 'fibre' },
    { key: 'c', pct: gaps.c / target.c, label: 'carbs' },
    { key: 'f', pct: gaps.f / target.f, label: 'healthy fats' },
  ]
  ratios.sort((a, b) => b.pct - a.pct)
  const topGap = ratios[0]

  const loggedIds = new Set(logged.map((m) => m.id))

  // Candidate pool based on slot
  const slotPool = {
    breakfast: ['porridge-bowl', 'greek-yogurt', 'eggs-2', 'oats', 'berries', 'banana', 'bread-whole'],
    lunch: ['chicken-rice-bowl', 'salad-bowl', 'lentils', 'quinoa', 'tofu', 'salmon', 'chicken-breast'],
    dinner: ['salmon', 'chicken-breast', 'tofu', 'lentils', 'pasta-bolognese', 'sweet-potato', 'roasted-veg'],
    snack: ['greek-yogurt', 'almonds', 'apple', 'berries', 'cottage-cheese', 'hummus', 'dark-chocolate'],
  }
  const pool = (slotPool[slot] || slotPool.snack).filter((id) => !loggedIds.has(id))

  // Score every candidate by how well it closes the top gap
  const scored = pool.map((id) => {
    const food = foods.find((f) => f.id === id)
    if (!food) return null
    const gain = food[topGap.key] || 0
    const overflow = Math.max(0, food.kcal - Math.max(gaps.kcal, 0)) // penalise over-eating
    return { food, score: gain * 4 - overflow * 0.05 }
  }).filter(Boolean)

  scored.sort((a, b) => b.score - a.score)
  const pick = scored[0]?.food || foods.find((f) => f.id === slotPool[slot][0])

  // Reason text
  let reason
  if (totals.kcal === 0) {
    reason = `It's ${slot} time — start your day strong.`
  } else if (topGap.pct > 0.4) {
    reason = `You're behind on ${topGap.label} today. This will help close the gap.`
  } else if (totals.kcal > target.kcal) {
    reason = `You're over your calorie target — a lighter ${slot} keeps the day balanced.`
  } else {
    reason = `A solid choice for ${slot}, fitting your remaining day.`
  }

  return { slot, food: pick, reason, totals, gaps, topGap }
}
