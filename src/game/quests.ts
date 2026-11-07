import { SaveData, QuestItem, BadgeItem } from './types';

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  icon: string;
  getProgress: (s: SaveData) => number;
}

// ─── 100+ QUEST DEFINITIONS (ZERO UNICODE EMOJIS, 100% PIXEL ICON KEYS) ───
export const QUEST_DEFINITIONS: QuestDefinition[] = [
  // ── 1. CAMPAIGN PROGRESSION (Levels 1 - 30) ──
  { id: 'prog_lvl_1', title: 'First Steps', description: 'Clear Level 1 in The Chicken Coop', target: 2, rewardCoins: 25, icon: 'chick', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_2', title: 'Coop Explorer', description: 'Reach Level 3 in World 1', target: 3, rewardCoins: 30, icon: 'coop', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_3', title: 'Barnyard Pioneer', description: 'Reach Level 4 in World 1', target: 4, rewardCoins: 35, icon: 'coop', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_4', title: 'Coop Graduate', description: 'Clear World 1 (reach Level 6)', target: 6, rewardCoins: 50, icon: 'coop', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_5', title: 'Grassy Trails Debut', description: 'Venture into World 2 (reach Level 7)', target: 7, rewardCoins: 45, icon: 'chick', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_6', title: 'Meadow Roamer', description: 'Reach Level 8 in World 2', target: 8, rewardCoins: 50, icon: 'chick', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_7', title: 'Trail Master', description: 'Reach Level 9 in World 2', target: 9, rewardCoins: 55, icon: 'chick', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_8', title: 'Juvenile Evolution', description: 'Evolve into Juvenile form at Level 10', target: 10, rewardCoins: 75, icon: 'juvenile', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_9', title: 'Jungle of Fire Entry', description: 'Brave World 4 (reach Level 11)', target: 11, rewardCoins: 60, icon: 'lightning', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_10', title: 'Volcano Hiker', description: 'Reach Level 12 in Jungle of Fire', target: 12, rewardCoins: 65, icon: 'lightning', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_11', title: 'Lava Strider', description: 'Reach Level 13 in Jungle of Fire', target: 13, rewardCoins: 70, icon: 'lightning', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_12', title: 'Temple Raider', description: 'Reach Level 14 in Jungle of Fire', target: 14, rewardCoins: 75, icon: 'totem', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_13', title: 'Teen Evolution', description: 'Evolve into armed Teen Chicken (Level 15)', target: 15, rewardCoins: 90, icon: 'rooster', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_14', title: 'Golden Knight', description: 'Reach Level 16 in Jungle of Fire', target: 16, rewardCoins: 80, icon: 'sword', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_15', title: 'Ancient Ruin Scout', description: 'Reach Level 17 in Jungle of Fire', target: 17, rewardCoins: 85, icon: 'totem', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_16', title: 'Magma Sprinter', description: 'Reach Level 18 in Jungle of Fire', target: 18, rewardCoins: 90, icon: 'lightning', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_17', title: 'Threshold of Frost', description: 'Reach Level 19 before the mountain peaks', target: 19, rewardCoins: 95, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_18', title: 'Adult Evolution', description: 'Reach Level 20 and evolve into Adult Hero Chicken', target: 20, rewardCoins: 120, icon: 'crown', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_19', title: 'Frozen Heights Scout', description: 'Reach Level 21 in World 5', target: 21, rewardCoins: 100, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_20', title: 'Blizzard Jumper', description: 'Reach Level 22 in World 5', target: 22, rewardCoins: 105, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_21', title: 'Glacial Climber', description: 'Reach Level 23 in World 5', target: 23, rewardCoins: 110, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_22', title: 'Bear Den Infiltrator', description: 'Reach Level 24 in World 5', target: 24, rewardCoins: 115, icon: 'wolf', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_23', title: 'Mount Cluckmore Pass', description: 'Reach Level 25 in World 5', target: 25, rewardCoins: 120, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_24', title: 'Frostbite Survivor', description: 'Reach Level 26 in World 5', target: 26, rewardCoins: 125, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_25', title: 'Alpine Champion', description: 'Reach Level 27 in World 5', target: 27, rewardCoins: 130, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_26', title: 'Apex Peak Climber', description: 'Reach Level 28 in World 5', target: 28, rewardCoins: 135, icon: 'snowflake', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_27', title: 'Dragon Lair Threshold', description: 'Reach Level 29 before Cockatrice lair', target: 29, rewardCoins: 140, icon: 'dragon', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_28', title: 'Grand Finale Level 30', description: 'Reach Level 30 (The Green Fields Finale)', target: 30, rewardCoins: 160, icon: 'crown', getProgress: s => s.unlockedLevel },
  { id: 'prog_lvl_29', title: 'Cockatrice Slayer', description: 'Defeat the 200 Hearts Ancient Cockatrice Boss', target: 1, rewardCoins: 300, icon: 'dragon', getProgress: s => (s.hasCompletedGame ? 1 : 0) },
  { id: 'prog_lvl_30', title: 'Legend of the Roost', description: 'Complete the entire campaign from egg to finale', target: 1, rewardCoins: 350, icon: 'trophy', getProgress: s => (s.hasCompletedGame ? 1 : 0) },

  // ── 2. PELLET COIN WEALTH MILESTONES (15 Quests) ──
  { id: 'coin_10', title: 'Pocket Change', description: 'Collect 10 Pellet Coins', target: 10, rewardCoins: 15, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_25', title: 'Pellet Gatherer', description: 'Collect 25 Pellet Coins', target: 25, rewardCoins: 25, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_50', title: 'Pellet Hoarder', description: 'Gather 50 Pellet Coins', target: 50, rewardCoins: 40, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_75', title: 'Pellet Enthusiast', description: 'Gather 75 Pellet Coins', target: 75, rewardCoins: 50, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_100', title: 'Century of Gold', description: 'Hold 100 Pellet Coins in bank', target: 100, rewardCoins: 65, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_150', title: 'Pellet Baron', description: 'Amass 150 Pellet Coins', target: 150, rewardCoins: 85, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_200', title: 'Golden Roost', description: 'Hold 200 Pellet Coins in bank', target: 200, rewardCoins: 100, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_250', title: 'Silo Stuffer', description: 'Amass 250 Pellet Coins', target: 250, rewardCoins: 120, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_300', title: 'Pellet Magnate', description: 'Amass 300 Pellet Coins', target: 300, rewardCoins: 140, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_400', title: 'Barnyard Tycoon', description: 'Accumulate 400 Pellet Coins', target: 400, rewardCoins: 175, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_500', title: 'Grand Silo Treasury', description: 'Accumulate 500 Pellet Coins', target: 500, rewardCoins: 200, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_600', title: 'Golden Feather Bank', description: 'Accumulate 600 Pellet Coins', target: 600, rewardCoins: 240, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_750', title: 'King of Pellets', description: 'Accumulate 750 Pellet Coins', target: 750, rewardCoins: 280, icon: 'money', getProgress: s => s.totalCoins },
  { id: 'coin_1000', title: 'Avian Millionaire', description: 'Accumulate 1000 Pellet Coins', target: 1000, rewardCoins: 350, icon: 'trophy', getProgress: s => s.totalCoins },
  { id: 'coin_1500', title: 'Legendary Pellet Vault', description: 'Accumulate 1500 Pellet Coins', target: 1500, rewardCoins: 500, icon: 'trophy', getProgress: s => s.totalCoins },

  // ── 3. PREDATOR HUNTING & COMBAT (15 Quests) ──
  { id: 'pred_1', title: 'First Blood', description: 'Defeat your first predator', target: 1, rewardCoins: 25, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_3', title: 'Trail Defender', description: 'Defeat 3 wild predators', target: 3, rewardCoins: 35, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_5', title: 'Predator Hunter', description: 'Defeat 5 wild predators (Foxes, Wolves, Bears)', target: 5, rewardCoins: 50, icon: 'fox', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_8', title: 'Pack Buster', description: 'Defeat 8 predators', target: 8, rewardCoins: 65, icon: 'wolf', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_12', title: 'Fox Tracker', description: 'Defeat 12 predators', target: 12, rewardCoins: 80, icon: 'fox', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_16', title: 'Wolf Stalker', description: 'Defeat 16 predators', target: 16, rewardCoins: 95, icon: 'wolf', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_20', title: 'Bear Tamer', description: 'Defeat 20 predators in combat', target: 20, rewardCoins: 110, icon: 'wolf', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_25', title: 'Avian Gladiator', description: 'Defeat 25 predators across levels', target: 25, rewardCoins: 130, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_30', title: 'Forest Warden', description: 'Defeat 30 predators', target: 30, rewardCoins: 150, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_40', title: 'Apex Predator of the Wild', description: 'Defeat 40 predators', target: 40, rewardCoins: 180, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_50', title: 'Half-Century of Slashes', description: 'Defeat 50 predators', target: 50, rewardCoins: 220, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_65', title: 'Claw & Beak Veteran', description: 'Defeat 65 predators', target: 65, rewardCoins: 260, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_80', title: 'Bane of the Wild', description: 'Defeat 80 predators', target: 80, rewardCoins: 300, icon: 'sword', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_100', title: 'Centurion of Feathered Might', description: 'Defeat 100 predators', target: 100, rewardCoins: 400, icon: 'trophy', getProgress: s => s.stats?.enemiesDefeated || 0 },
  { id: 'pred_150', title: 'The Untamed Champion', description: 'Defeat 150 predators', target: 150, rewardCoins: 550, icon: 'trophy', getProgress: s => s.stats?.enemiesDefeated || 0 },

  // ── 4. TRAPS & HAZARD SURVIVAL (10 Quests) ──
  { id: 'trap_1', title: 'Watch Your Step', description: 'Trigger or dodge 1 falling temple trap', target: 1, rewardCoins: 25, icon: 'totem', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_3', title: 'Boulder Dodger', description: 'Survive 3 falling boulder traps', target: 3, rewardCoins: 45, icon: 'totem', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_5', title: 'Trap Survivor', description: 'Survive 5 falling boulder traps', target: 5, rewardCoins: 65, icon: 'totem', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_8', title: 'Daredevil Cluck', description: 'Survive 8 temple boulder traps', target: 8, rewardCoins: 90, icon: 'lightning', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_12', title: 'Indiana Cluck', description: 'Survive 12 temple boulder traps', target: 12, rewardCoins: 110, icon: 'totem', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_16', title: 'Cat-Like Reflexes', description: 'Survive 16 hazard traps', target: 16, rewardCoins: 135, icon: 'lightning', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_20', title: 'Labyrinth Acrobat', description: 'Survive 20 hazard traps', target: 20, rewardCoins: 160, icon: 'totem', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_25', title: 'Immune to Danger', description: 'Survive 25 hazard traps', target: 25, rewardCoins: 190, icon: 'lightning', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_30', title: 'Master of Agility', description: 'Survive 30 hazard traps', target: 30, rewardCoins: 230, icon: 'trophy', getProgress: s => s.stats?.trapsTriggered || 0 },
  { id: 'trap_40', title: 'Hazard Houdini', description: 'Survive 40 hazard traps', target: 40, rewardCoins: 300, icon: 'trophy', getProgress: s => s.stats?.trapsTriggered || 0 },

  // ── 5. SHIELD DEFENSE & PARRY (10 Quests) ──
  { id: 'shd_1', title: 'Aegis Initiate', description: 'Deflect 1 attack or fireball with Royal Shield', target: 1, rewardCoins: 35, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_2', title: 'Shield Practice', description: 'Deflect 2 enemy attacks or projectiles', target: 2, rewardCoins: 50, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_3', title: 'Shield Guardian', description: 'Deflect 3 attacks or fireballs', target: 3, rewardCoins: 70, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_5', title: 'Iron Bulwark', description: 'Deflect 5 attacks or fireballs', target: 5, rewardCoins: 95, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_8', title: 'Reflective Feather', description: 'Deflect 8 attacks or fireballs', target: 8, rewardCoins: 120, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_12', title: 'Counter-Striker', description: 'Deflect 12 attacks or fireballs', target: 12, rewardCoins: 150, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_16', title: 'Dragon Parrier', description: 'Deflect 16 fireballs back at enemies', target: 16, rewardCoins: 180, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_20', title: 'Titan Aegis Master', description: 'Deflect 20 attacks or projectiles', target: 20, rewardCoins: 220, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_25', title: 'Impenetrable Bastion', description: 'Deflect 25 attacks or projectiles', target: 25, rewardCoins: 270, icon: 'shield', getProgress: s => s.stats?.projectilesDeflected || 0 },
  { id: 'shd_35', title: 'Immortal Mirror', description: 'Deflect 35 attacks or projectiles', target: 35, rewardCoins: 350, icon: 'trophy', getProgress: s => s.stats?.projectilesDeflected || 0 },

  // ── 6. GEAR & SHOP UPGRADES (12 Quests) ──
  { id: 'shop_1', title: 'First Investment', description: 'Make 1 purchase in Silkie’s Emporium', target: 1, rewardCoins: 30, icon: 'shop', getProgress: s => s.stats?.shopPurchases || 0 },
  { id: 'shop_3', title: 'Regular Customer', description: 'Make 3 purchases in Silkie’s Emporium', target: 3, rewardCoins: 50, icon: 'shop', getProgress: s => s.stats?.shopPurchases || 0 },
  { id: 'shop_5', title: 'Big Spender', description: 'Make 5 purchases in Silkie’s Emporium', target: 5, rewardCoins: 75, icon: 'shop', getProgress: s => s.stats?.shopPurchases || 0 },
  { id: 'shop_8', title: 'Silkie VIP', description: 'Make 8 purchases in Silkie’s Emporium', target: 8, rewardCoins: 110, icon: 'shop', getProgress: s => s.stats?.shopPurchases || 0 },
  { id: 'shop_12', title: 'Shopaholic Rooster', description: 'Make 12 purchases in the shop', target: 12, rewardCoins: 160, icon: 'shop', getProgress: s => s.stats?.shopPurchases || 0 },
  { id: 'upg_heart_1', title: 'Healthy Chick', description: 'Upgrade Extra Hearts to Level 1', target: 1, rewardCoins: 35, icon: 'chick', getProgress: s => s.upgrades?.extraHearts || 0 },
  { id: 'upg_heart_3', title: 'Titan Clucker', description: 'Max out Extra Hearts to Level 3', target: 3, rewardCoins: 85, icon: 'chick', getProgress: s => s.upgrades?.extraHearts || 0 },
  { id: 'upg_spd_1', title: 'Swift Feathers I', description: 'Upgrade Speed Boost to Level 1', target: 1, rewardCoins: 35, icon: 'lightning', getProgress: s => s.upgrades?.speedBoost || 0 },
  { id: 'upg_spd_3', title: 'Roadrunner Cluck', description: 'Max out Speed Boost to Level 3', target: 3, rewardCoins: 85, icon: 'lightning', getProgress: s => s.upgrades?.speedBoost || 0 },
  { id: 'upg_jmp_1', title: 'Springy Claws I', description: 'Upgrade Jump Boost to Level 1', target: 1, rewardCoins: 35, icon: 'sparkles', getProgress: s => s.upgrades?.jumpBoost || 0 },
  { id: 'upg_jmp_3', title: 'Sky High Jumper', description: 'Max out Jump Boost to Level 3', target: 3, rewardCoins: 85, icon: 'sparkles', getProgress: s => s.upgrades?.jumpBoost || 0 },
  { id: 'upg_beak_1', title: 'Iron Beak Equip', description: 'Equip the Iron Beak Strike upgrade', target: 1, rewardCoins: 40, icon: 'sword', getProgress: s => s.upgrades?.ironBeak || 0 },

  // ── 7. COMBAT ARMOR & WEAPONS (8 Quests) ──
  { id: 'arm_iron', title: 'Iron Cuirass', description: 'Equip or acquire Iron Armor in battle', target: 1, rewardCoins: 45, icon: 'shield', getProgress: s => (s.armor !== 'none' ? 1 : 0) },
  { id: 'arm_gold', title: 'Golden Knight Plate', description: 'Equip or acquire Gold Armor', target: 1, rewardCoins: 80, icon: 'crown', getProgress: s => (s.armor === 'gold' || s.armor === 'diamond' ? 1 : 0) },
  { id: 'arm_diam', title: 'Diamond Crystal Cuirass', description: 'Acquire apex Diamond Armor', target: 1, rewardCoins: 150, icon: 'diamond', getProgress: s => (s.armor === 'diamond' ? 1 : 0) },
  { id: 'swd_iron', title: 'Iron Wing Blade', description: 'Equip or acquire Iron Sword', target: 1, rewardCoins: 45, icon: 'sword', getProgress: s => (s.sword !== 'none' ? 1 : 0) },
  { id: 'swd_gold', title: 'Gilded Broadsword', description: 'Equip or acquire Gold Sword', target: 1, rewardCoins: 80, icon: 'sword', getProgress: s => (s.sword === 'gold' || s.sword === 'diamond' ? 1 : 0) },
  { id: 'swd_diam', title: 'Diamond Greatsword', description: 'Acquire apex Diamond Greatsword', target: 1, rewardCoins: 150, icon: 'diamond', getProgress: s => (s.sword === 'diamond' ? 1 : 0) },
  { id: 'gear_full_gold', title: 'Full Golden Regent', description: 'Equip both Gold Armor and Gold Sword', target: 2, rewardCoins: 120, icon: 'crown', getProgress: s => ((s.armor === 'gold' || s.armor === 'diamond' ? 1 : 0) + (s.sword === 'gold' || s.sword === 'diamond' ? 1 : 0)) },
  { id: 'gear_full_diam', title: 'Diamond Apex Legend', description: 'Equip both Diamond Armor and Diamond Sword', target: 2, rewardCoins: 250, icon: 'diamond', getProgress: s => ((s.armor === 'diamond' ? 1 : 0) + (s.sword === 'diamond' ? 1 : 0)) },

  // ── 8. APPEARANCE & SKIN COLLECTOR (10 Quests) ──
  { id: 'skin_first', title: 'New Plumage', description: 'Unlock any color variation in the shop', target: 2, rewardCoins: 40, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_3', title: 'Fashionable Avian', description: 'Unlock 3 distinct chicken color variations', target: 3, rewardCoins: 60, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_5', title: 'Rainbow Wardrobe', description: 'Unlock 5 distinct chicken color variations', target: 5, rewardCoins: 90, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_8', title: 'Plumage Connoisseur', description: 'Unlock 8 distinct chicken color variations', target: 8, rewardCoins: 125, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_12', title: 'Master of Colors', description: 'Unlock 12 distinct chicken color variations', target: 12, rewardCoins: 175, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_16', title: 'Avian Artistry', description: 'Unlock 16 distinct chicken color variations', target: 16, rewardCoins: 220, icon: 'sparkles', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_20', title: 'Legendary Stylist', description: 'Unlock 20 distinct chicken color variations', target: 20, rewardCoins: 300, icon: 'trophy', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_25', title: 'Complete Collection 25', description: 'Unlock all 25 chicken skins across all rarities', target: 25, rewardCoins: 500, icon: 'trophy', getProgress: s => (s.unlockedSkins?.length || 1) },
  { id: 'skin_rare', title: 'Rare Elegance', description: 'Equip any Rare or higher plumage skin', target: 1, rewardCoins: 50, icon: 'sparkles', getProgress: s => (s.selectedSkin && s.selectedSkin !== 'classic' ? 1 : 0) },
  { id: 'skin_mythic', title: 'Mythic Ascendance', description: 'Equip a Mythic rarity skin (Phoenix, Cosmic, etc.)', target: 1, rewardCoins: 100, icon: 'crown', getProgress: s => (['phoenix', 'cosmic_nebula', 'prismatic_rainbow', 'dragon_scale', 'cyber_neon'].includes(s.selectedSkin || '') ? 1 : 0) },

  // ── 9. ACROBATICS & FLAWLESS SKILL (10 Quests) ──
  { id: 'flawless_1', title: 'Untouchable Chick', description: 'Clear 1 level without taking any damage', target: 1, rewardCoins: 60, icon: 'sparkles', getProgress: s => s.stats?.levelsClearedWithoutDamage || 0 },
  { id: 'flawless_2', title: 'Ghost of the Barn', description: 'Clear 2 levels without taking any damage', target: 2, rewardCoins: 85, icon: 'sparkles', getProgress: s => s.stats?.levelsClearedWithoutDamage || 0 },
  { id: 'flawless_3', title: 'Feathered Phantom', description: 'Clear 3 levels without taking any damage', target: 3, rewardCoins: 110, icon: 'sparkles', getProgress: s => s.stats?.levelsClearedWithoutDamage || 0 },
  { id: 'flawless_5', title: 'Perfectionist', description: 'Clear 5 levels without taking any damage', target: 5, rewardCoins: 150, icon: 'sparkles', getProgress: s => s.stats?.levelsClearedWithoutDamage || 0 },
  { id: 'flawless_8', title: 'Master of Evading', description: 'Clear 8 levels without taking any damage', target: 8, rewardCoins: 210, icon: 'trophy', getProgress: s => s.stats?.levelsClearedWithoutDamage || 0 },
  { id: 'secret_back_home', title: 'Old Nest Revisited', description: 'Revisit Level 1 coop as an evolved chicken', target: 1, rewardCoins: 100, icon: 'coop', getProgress: s => (s.stats?.visitedCoopEvolved ? 1 : 0) },
  { id: 'revive_token_own', title: 'Second Chance', description: 'Acquire Phoenix Feather revive charm in shop', target: 1, rewardCoins: 60, icon: 'sparkles', getProgress: s => (s.upgrades?.reviveToken ? 1 : 0) },
  { id: 'glider_own', title: 'Fluffy Aviator', description: 'Acquire Fluffy Feathers Glider charm in shop', target: 1, rewardCoins: 60, icon: 'chick', getProgress: s => (s.upgrades?.fluffyGlider ? 1 : 0) },
  { id: 'magnet_own', title: 'Golden Attraction', description: 'Acquire Golden Coin Magnet charm in shop', target: 1, rewardCoins: 60, icon: 'corn', getProgress: s => (s.upgrades?.coinMagnet ? 1 : 0) },
  { id: 'plumage_own', title: 'Dazzling Aura', description: 'Acquire Golden Plumage charm in shop', target: 1, rewardCoins: 75, icon: 'crown', getProgress: s => (s.upgrades?.goldenPlumage ? 1 : 0) },
];

// ─── BADGE DEFINITIONS (INCLUDING 5 SUPER SECRET BADGES) ───
export const BADGE_DEFINITIONS: Omit<BadgeItem, 'unlocked'>[] = [
  // ── Standard Badges ──
  { id: 'the_hatchling', title: 'The Hatchling', description: 'Cracked out of the egg and began the grand journey', icon: 'chick', tier: 'bronze' },
  { id: 'corn_nibbler', title: 'Pellet Nibbler', description: 'Collected your first golden Pellet Coin', icon: 'money', tier: 'bronze' },
  { id: 'predator_bane', title: 'Predator Bane', description: 'Slain your first wild predator in the wild trails', icon: 'sword', tier: 'silver' },
  { id: 'iron_feather', title: 'Iron Feather', description: 'Found chest and donned the iron battle cuirass', icon: 'shield', tier: 'silver' },
  { id: 'golden_crest', title: 'Golden Crest', description: 'Wielded the glorious golden plate and sword', icon: 'crown', tier: 'gold' },
  { id: 'diamond_hero', title: 'Diamond Hero', description: 'Attained legendary blue diamond combat armor', icon: 'diamond', tier: 'diamond' },
  { id: 'aegis_master', title: 'Aegis Master', description: 'Shield-deflected a lethal boss fireball back to stun it', icon: 'shield', tier: 'gold' },
  { id: 'frost_walker', title: 'Frost Walker', description: 'Scaled the snow, dirt, and icicles of World 5', icon: 'snowflake', tier: 'gold' },
  { id: 'apex_conqueror', title: 'Apex Conqueror', description: 'Vanquished the 200 Hearts Ancient Cockatrice', icon: 'dragon', tier: 'diamond' },
  { id: 'grand_champion', title: 'Grand Champion', description: 'Mastered all 30 stages and unlocked every secret', icon: 'trophy', tier: 'diamond' },

  // ── Existing Secret Badges ──
  { id: 'back_home', title: 'Back Home', description: 'Revisited the Level 1 coop as an evolved chicken (Juvenile, Teen, or Adult)', icon: 'coop', tier: 'diamond', isSecret: true },
  { id: 'feathered_tycoon', title: 'Feathered Tycoon', description: 'Amassed 300+ Pellet Coins in your pouch', icon: 'money', tier: 'gold', isSecret: true },
  { id: 'daredevil_cluck', title: 'Daredevil Cluck', description: 'Triggered and survived 8 falling temple boulders', icon: 'lightning', tier: 'silver', isSecret: true },
  { id: 'roadrunner_spirit', title: 'Roadrunner Spirit', description: 'Attained Level 3 Swift Feathers speed boost', icon: 'lightning', tier: 'gold', isSecret: true },
  { id: 'iron_beak_master', title: 'Iron Beak Master', description: 'Equipped the Iron Beak upgrade to crush predators', icon: 'sword', tier: 'silver', isSecret: true },
  { id: 'sky_glider', title: 'Sky Glider', description: 'Mastered gentle descent with Fluffy Feathers Glider', icon: 'chick', tier: 'gold', isSecret: true },

  // ── 5 BRAND NEW SUPER SECRET BADGES ──
  {
    id: 'secret_lost_roost',
    title: 'The Lost Roost',
    description: 'Discovered the hidden ancestral coop deep in the wild forest (Level 6)',
    icon: 'coop',
    tier: 'diamond',
    isSecret: true,
  },
  {
    id: 'secret_draconic_parry',
    title: 'Draconic Deflector',
    description: 'Deflected 5 dragon fire projectiles in a single battle against the Cockatrice',
    icon: 'dragon',
    tier: 'diamond',
    isSecret: true,
  },
  {
    id: 'secret_golden_egg_hoard',
    title: 'Golden Egg Hoard',
    description: 'Amassed a legendary royal treasury of 500+ Pellet Coins',
    icon: 'money',
    tier: 'diamond',
    isSecret: true,
  },
  {
    id: 'secret_feathered_pacifist',
    title: 'Peaceful Plumage',
    description: 'Cleared a treacherous stage with pure jumping skill without defeating any predators',
    icon: 'sparkles',
    tier: 'gold',
    isSecret: true,
  },
  {
    id: 'secret_phoenix_rebirth',
    title: 'Eternal Rebirth',
    description: 'Cheated fate and rose from ashes with the sacred Phoenix Feather charm',
    icon: 'sparkles',
    tier: 'diamond',
    isSecret: true,
  },
];

export function getQuestsWithStatus(saveData: SaveData): QuestItem[] {
  const claimed = saveData.claimedQuests || {};
  return QUEST_DEFINITIONS.map(q => {
    const current = Math.min(q.target, q.getProgress(saveData));
    const completed = current >= q.target;
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      target: q.target,
      current,
      rewardCoins: q.rewardCoins,
      completed,
      claimed: Boolean(claimed[q.id]),
      icon: q.icon
    };
  });
}

export function getBadgesWithStatus(saveData: SaveData): BadgeItem[] {
  const unlockedSet = new Set(saveData.unlockedBadges || []);

  // Compute unlock conditions dynamically
  const isUnlocked = (id: string): boolean => {
    if (unlockedSet.has(id)) return true;
    switch (id) {
      case 'the_hatchling':
        return saveData.hasSeenIntro || saveData.unlockedLevel > 1;
      case 'corn_nibbler':
        return saveData.totalCoins > 0;
      case 'predator_bane':
        return (saveData.stats?.enemiesDefeated || 0) >= 1;
      case 'iron_feather':
        return saveData.armor === 'iron' || saveData.armor === 'gold' || saveData.armor === 'diamond';
      case 'golden_crest':
        return saveData.armor === 'gold' || saveData.armor === 'diamond';
      case 'diamond_hero':
        return saveData.armor === 'diamond';
      case 'aegis_master':
        return (saveData.stats?.projectilesDeflected || 0) >= 1;
      case 'frost_walker':
        return saveData.unlockedLevel >= 20;
      case 'apex_conqueror':
        return Boolean(saveData.hasCompletedGame);
      case 'grand_champion':
        return saveData.unlockedLevel >= 30 && Boolean(saveData.hasCompletedGame);
      case 'back_home':
        return Boolean(saveData.stats?.visitedCoopEvolved);
      case 'feathered_tycoon':
        return (saveData.totalCoins || 0) >= 300;
      case 'daredevil_cluck':
        return (saveData.stats?.trapsTriggered || 0) >= 8;
      case 'roadrunner_spirit':
        return (saveData.upgrades?.speedBoost || 0) >= 3;
      case 'iron_beak_master':
        return (saveData.upgrades?.ironBeak || 0) >= 1;
      case 'sky_glider':
        return Boolean(saveData.upgrades?.fluffyGlider);
      // ── 5 Super Secret Badges Unlocks ──
      case 'secret_lost_roost':
        return saveData.unlockedLevel >= 7 && Boolean(saveData.stats?.visitedCoopEvolved);
      case 'secret_draconic_parry':
        return (saveData.stats?.projectilesDeflected || 0) >= 5;
      case 'secret_golden_egg_hoard':
        return (saveData.totalCoins || 0) >= 500;
      case 'secret_feathered_pacifist':
        return (saveData.stats?.levelsClearedWithoutDamage || 0) >= 1;
      case 'secret_phoenix_rebirth':
        return Boolean(saveData.upgrades?.reviveToken);
      default:
        return false;
    }
  };

  return BADGE_DEFINITIONS.map(b => ({
    ...b,
    unlocked: isUnlocked(b.id)
  }));
}

export function countUnclaimedQuests(saveData: SaveData): number {
  const quests = getQuestsWithStatus(saveData);
  return quests.filter(q => q.completed && !q.claimed).length;
}
