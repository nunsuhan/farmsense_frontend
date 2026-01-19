import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const RAGChat = ({ onMenuClick }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: '무엇이든 물어보세요! 포도 농사 전문 AI입니다.' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages([...messages, userMsg]);
        setInput('');

        // Simulation of AI response
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: '샤인머스캣 적심 시기는 개화 7-10일 전이 적기입니다.\n\n보통 5월 중순~하순으로, 신초가 12-15마디일 때 진행하는 것이 좋습니다.\n\n📎 출처: 포도재배기술(2023)'
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#1E1E2E' }}>
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={onMenuClick}
                    style={{
                        marginRight: 12,
                    }}
                >
                    <Feather name="menu" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, color: 'white' }}>AI 농사 상담</Text>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }}>
                {messages.map(msg => (
                    <View key={msg.id} style={{
                        flexDirection: 'row',
                        marginBottom: 20,
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        {msg.sender === 'ai' && (
                            <View style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: '#FFD700',
                                alignItems: 'center', justifyContent: 'center', marginRight: 8,
                            }}>
                                <MaterialCommunityIcons name="robot" size={20} color="#000" />
                            </View>
                        )}
                        <View style={{
                            backgroundColor: msg.sender === 'user' ? '#1A1A2E' : '#16213E',
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 16,
                            maxWidth: '80%',
                            borderWidth: msg.sender === 'user' ? 1 : 0,
                            borderColor: '#FFD700',
                        }}>
                            <Text style={{ color: 'white' }}>{msg.text}</Text>
                        </View>
                        {msg.sender === 'user' && (
                            <View style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: '#555',
                                alignItems: 'center', justifyContent: 'center', marginLeft: 8,
                            }}>
                                <Feather name="user" size={20} color="#fff" />
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Suggested Chips */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', gap: 8 }}>
                {['GA 처리 농도', '당도 높이기', '열과방지'].map(chip => (
                    <TouchableOpacity key={chip} style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 20,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                    }}
                        onPress={() => setInput(chip + ' 알려줘')}
                    >
                        <Text style={{ color: '#fff', fontSize: 12 }}>{chip}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Input Area */}
            <View style={{ padding: 16, backgroundColor: '#16213E', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="메시지 입력..."
                    placeholderTextColor="#999"
                    style={{
                        flex: 1,
                        backgroundColor: '#0D0D1A',
                        borderRadius: 20,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        color: '#fff',
                    }}
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity>
                    <Feather name="mic" size={24} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSend}>
                    <Feather name="send" size={24} color="#FFD700" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RAGChat;
