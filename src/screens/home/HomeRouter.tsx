/**
 * HomeRouter - 인증 상태에 따라 화면 분기
 * 비로그인 → GuestHomeScreen
 * 로그인 → ReportHomeScreen
 */
import React from 'react';
import { useStore } from '../../store/useStore';
import GuestHomeScreen from './GuestHomeScreen';
import ReportHomeScreen from './ReportHomeScreen';

const HomeRouter = () => {
  const user = useStore((s) => s.user);
  return user ? <ReportHomeScreen /> : <GuestHomeScreen />;
};

export default HomeRouter;
