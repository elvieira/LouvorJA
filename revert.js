const fs = require('fs');
const files = [
  'src/modules/core/system/config/interface/components/TabAppearance.vue',
  'src/modules/core/system/config/interface/components/TabGeneral.vue',
  'src/modules/core/system/config/interface/components/TabMedia.vue',
  'src/modules/core/system/config/interface/components/TabProjection.vue',
  'src/modules/core/app/help/interface/components/HelpAbout.vue',
  'src/modules/core/app/help/interface/components/HelpDevelopers.vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace opening tags
  content = content.replace(/<SettingsCard([^>]*)>/g, '<v-card class="settings-card rounded-xl pa-2$1" flat style="background: var(--card-bg); box-shadow: var(--shadow);">\n        <v-card-text class="pa-6">');
  // Re-fix multiple classes if any
  content = content.replace(/class="settings-card rounded-xl pa-2 class="([^"]+)"/g, 'class="settings-card rounded-xl pa-2 $1"');
  
  // Replace closing tags
  content = content.replace(/<\/SettingsCard>/g, '</v-card-text>\n      </v-card>');
  
  // Remove import
  content = content.replace(/import SettingsCard from "@/components\/SettingsCard\.vue";\n/g, '');
  content = content.replace(/SettingsCard,\n/g, '');
  content = content.replace(/SettingsCard\n/g, '');
  
  // Add style scoped if not there
  if (!content.includes('<style scoped>')) {
    content += `\n<style scoped>\n.settings-card {\n  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;\n}\n.settings-card:hover {\n  box-shadow: var(--shadow-hover) !important;\n  transform: translateY(-1px);\n}\n</style>\n`;
  }
  
  fs.writeFileSync(file, content);
  console.log('Reverted', file);
});
