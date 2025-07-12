import { memo, useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export type MessageInputViewProps = {
  onSend: (message: string) => Promise<void>;
};

export const MessageInputView = memo(({ onSend }: MessageInputViewProps) => {
  const [message, setMessage] = useState('');

  return (
    <View
      style={{
        padding: 5,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 33,
      }}
    >
      <TextInput
        value={message}
        onChangeText={setMessage}
        style={{
          flex: 1,
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
        }}
        placeholder="Nachricht eingeben..."
        multiline
      />
      <Button title="✉️" onPress={() => onSend(message)} />
    </View>
  );
});
MessageInputView.displayName = 'MessageInputView';
