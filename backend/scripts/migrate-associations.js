const fs = require('fs');
const path = require('path');

/**
 * Migration script to update association names from legacy to new format:
 * - placeDetails → place
 * - cityData → city
 */

const controllersDir = path.join(__dirname, '../src/controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

const replacements = [
  // placeDetails → place
  { from: /\.placeDetails\b/g, to: '.place' },
  { from: /activity\.placeDetails/g, to: 'activity.place' },
  { from: /a\.placeDetails/g, to: 'a.place' },
  { from: /place\.placeDetails/g, to: 'place.place' },
  { from: /as: "placeDetails"/g, to: 'as: "place"' },
  { from: /as: 'placeDetails'/g, to: "as: 'place'" },

  // cityData → city (but be careful with city.cityData)
  { from: /user\.cityData\b/g, to: 'user.city' },
  { from: /author\.cityData\b/g, to: 'author.city' },
  { from: /follower\.cityData\b/g, to: 'follower.city' },
  { from: /followee\.cityData\b/g, to: 'followee.city' },
  { from: /as: "cityData"/g, to: 'as: "city"' },
  { from: /as: 'cityData'/g, to: "as: 'city'" },
];

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file}: ${fileChanges} changes`);
    totalChanges += fileChanges;
  }
});

console.log(`\n✅ Total: ${totalChanges} changes across ${files.length} files`);
