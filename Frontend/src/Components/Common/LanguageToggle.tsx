import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleLanguage } from '../../store/slices/languageSlice';
import { FaLanguage } from 'react-icons/fa';

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LanguageText = styled.span`
  text-transform: uppercase;
  font-weight: 700;
`;

const LanguageToggle = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);

  const handleToggle = () => {
    dispatch(toggleLanguage());
  };

  return (
    <ToggleButton onClick={handleToggle} title={`Switch to ${currentLanguage === 'en' ? 'Gujarati' : 'English'}`}>
      <FaLanguage />
      <LanguageText>{currentLanguage === 'en' ? 'EN' : 'GU'}</LanguageText>
    </ToggleButton>
  );
};

export default LanguageToggle;

