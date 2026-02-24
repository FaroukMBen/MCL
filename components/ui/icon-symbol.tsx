// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'book.fill': 'menu-book',
  'person.fill': 'person',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus': 'add',
  'chart.bar.fill': 'bar-chart',
  'building.2.fill': 'business',
  'list.bullet': 'format-list-bulleted',
  'square.grid.2x2.fill': 'grid-view',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'pencil': 'edit',
  'trash.fill': 'delete',
  'chevron.left': 'chevron-left',
  'calendar': 'event',
  'star.fill': 'star',
  'flame.fill': 'local-fire-department',
  'trophy.fill': 'emoji-events',
  'paintbrush.fill': 'brush',
  'gamecontroller.fill': 'sports-esports',
  'bolt.fill': 'bolt',
  'heart.fill': 'favorite',
  'sparkles': 'auto-awesome',
  'crown.fill': 'workspace-premium',
  'target': 'gps-fixed',
  'map.fill': 'map',
  'clock.fill': 'schedule',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'arrow.up.circle.fill': 'arrow-circle-up',
  'folder.fill': 'folder',
  'magnifyingglass': 'search',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
