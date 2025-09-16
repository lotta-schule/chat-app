import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from './IconSymbol';

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export interface SettingsItemProps {
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}


export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {childrenArray.map((child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              isLast: index === childrenArray.length - 1,
              key: index,
            });
          }
          return child;
        })}
      </View>
    </View>
  );
};

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  value,
  onPress,
  showChevron = false,
  isLast = false
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.item, isLast && styles.itemLast]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={styles.itemRight}>
          {value && <Text style={styles.itemValue}>{value}</Text>}
          {showChevron && (
            <IconSymbol
              name="chevron.right"
              size={14}
              color="#C7C7CC"
              style={styles.chevron}
            />
          )}
        </View>
      </View>
    </Component>
  );
};


const styles = StyleSheet.create({
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D70',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  itemTitle: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});