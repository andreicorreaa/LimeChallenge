import LanguageIcon from '@mui/icons-material/Language';
import { AppBar, Button, ButtonGroup, Container, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language || 'en';

  return (
    <AppBar position="static" className="bg-slate-900 border-b border-slate-800 shadow-none">
      <Container maxWidth="lg">
        <Toolbar className="px-0 flex justify-between">
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="text-cyan-400 font-bold tracking-tight uppercase no-underline hover:text-cyan-300"
          >
            {i18n.t('dashboard.title')}
          </Typography>

          <ButtonGroup
            size="small"
            variant="outlined"
            aria-label="language selector"
            className="border-slate-700"
          >
            <Button
              onClick={() => changeLanguage('en')}
              startIcon={<LanguageIcon fontSize="small" />}
              className={`capitalize px-3 py-1.5 font-semibold ${
                currentLang.startsWith('en')
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              EN
            </Button>
            <Button
              onClick={() => changeLanguage('es')}
              className={`capitalize px-3 py-1.5 font-semibold ${
                currentLang.startsWith('es')
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              ES
            </Button>
          </ButtonGroup>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
