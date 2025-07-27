import enemy1 from "../assets/images/enemies/enemy_1.jpeg";
import placeholderEnemy from "../assets/images/enemies/placeholder-enemy.jpeg";

// Map of enemy image filenames to their imported assets
const enemyImageMap: Record<string, string> = {
  enemy_1: enemy1.src,
  placeholder: placeholderEnemy.src,
};

/**
 * Get the actual image URL for an enemy based on the filename stored in the database
 * @param imageName - The filename stored in the database (e.g., "enemy_1")
 * @returns The actual image URL to use in the src attribute
 */
export const getEnemyImageSrc = (imageName: string): string => {
  // If it's already a full URL, return it as-is
  if (imageName.startsWith('http') || imageName.startsWith('/')) {
    return imageName;
  }
  
  // Look up the image in our map
  const mappedImage = enemyImageMap[imageName];
  if (mappedImage) {
    return mappedImage;
  }
  
  // Try with .jpeg extension if not found
  const withExtension = enemyImageMap[`${imageName}`];
  if (withExtension) {
    return withExtension;
  }
  
  // Return placeholder if not found
  return placeholderEnemy.src;
};

/**
 * Get all available enemy image options for form dropdowns
 */
export const getAvailableEnemyImages = (): Array<{ value: string; label: string; preview: string }> => {
  return [
    { value: "enemy_1", label: "Enemy 1 (Sea Creature)", preview: enemy1.src },
    { value: "placeholder", label: "Placeholder Enemy", preview: placeholderEnemy.src },
  ];
};

/**
 * Validate if an enemy image name exists
 */
export const isValidEnemyImage = (imageName: string): boolean => {
  return imageName in enemyImageMap || imageName.startsWith('http') || imageName.startsWith('/');
};