import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import styles from "../../../../styles/ApplicationFormStyles";

const DropdownPicker = ({
  placeholder,
  value,
  onValueChange,
  options,
  style,
  zIndex = 1000,
  onOpen,
  isOpen,
  onClose,
}) => {
  const handleSelect = (option) => {
    onValueChange(option.label || option);
    onClose();
  };

  const handleToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <View style={[styles.dropdownContainer, style, { zIndex: isOpen ? zIndex : 1 }]}>
      <TouchableOpacity
        style={[styles.input, styles.dropdownButton]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={[
          styles.dropdownMenu, 
          { 
            zIndex: zIndex + 100,
            height: options.length * 44,
            maxHeight: 'auto', 

            ...(Platform.OS === 'ios' && { 
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }),
          }
        ]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={`option-${index}`}
              style={[
                styles.dropdownOption,
                index === options.length - 1 && styles.lastDropdownOption
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionText}>
                {option.label || option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default DropdownPicker;