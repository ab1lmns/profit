import React from 'react';
import { ArrowRight, Check, ClipboardList, GraduationCap, Layers3, ShieldCheck, UserRound } from 'lucide-react';
import { DIRECTIONS } from '../data/directions';
import { Header } from './shared';

const steps = [
  { number: '01', title: 'Расскажите о себе', description: 'Создайте профиль и укажите навыки.' },
  { number: '02', title: 'Выберите направление', description: 'Найдите область, которая вам интересна.' },
  { number: '03', title: 'Пройдите тест', description: 'Ответьте на вопросы в сессии отбора.' },
];

export default function LandingPage() {
  return <>
    <Header><a className="landing-header-link" href="/teacher"><ShieldCheck size={16} /> Кабинет преподавателя <ArrowRight size={15} /></a></Header>
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><span className="landing-kicker-dot" /> Набор в спецгруппу ProfIT</span>
          <h1 id="landing-title">Найди своё место<br />в <span>ProfIT.</span></h1>
          <p>Выбери направление, расскажи о своих навыках и пройди отборочное тестирование. Начать можно с анкеты кандидата.</p>
          <div className="landing-hero-actions">
            <a className="landing-primary-link" href="/apply">Подать заявку <ArrowRight size={19} /></a>
            <a className="landing-secondary-link" href="#directions">Посмотреть направления</a>
          </div>
          <div className="landing-hero-note"><Check size={17} /> 8 направлений для разных интересов и навыков</div>
        </div>
        <div className="landing-preview" aria-label="Как проходит отбор">
          <div className="landing-preview-head"><span className="landing-preview-icon"><Layers3 size={22} /></span><div><span>ТВОЙ ПУТЬ В PROFIT</span><strong>Как всё устроено</strong></div></div>
          <ol className="landing-steps">{steps.map(step => <li key={step.number}><span className="landing-step-number">{step.number}</span><div><strong>{step.title}</strong><p>{step.description}</p></div><Check size={16} /></li>)}</ol>
          <div className="landing-preview-foot"><GraduationCap size={19} /><span>От анкеты до результата — в одном месте</span></div>
        </div>
      </section>

      <section className="landing-paths" aria-labelledby="landing-paths-title">
        <div className="landing-section-heading"><div><span className="landing-section-label">С ЧЕГО НАЧАТЬ</span><h2 id="landing-paths-title">Выберите свой путь</h2></div><p>Два понятных входа: для тех, кто хочет присоединиться, и для тех, кто проводит отбор.</p></div>
        <div className="landing-choices">
          <a className="landing-choice candidate" href="/apply"><span className="landing-choice-icon"><UserRound size={24} /></span><span className="landing-choice-content"><span className="landing-choice-label">Я КАНДИДАТ</span><strong>Подать заявку</strong><span>Создайте профиль, выберите направление и расскажите о себе.</span><span className="landing-choice-action">Перейти к анкете <ArrowRight size={17} /></span></span></a>
          <a className="landing-choice teacher" href="/teacher"><span className="landing-choice-icon"><ClipboardList size={24} /></span><span className="landing-choice-content"><span className="landing-choice-label">Я ПРЕПОДАВАТЕЛЬ</span><strong>Войти в кабинет</strong><span>Просматривайте кандидатов, создавайте тестовые сессии и проверяйте ответы.</span><span className="landing-choice-action">Открыть кабинет <ArrowRight size={17} /></span></span></a>
        </div>
      </section>

      <section className="landing-directions" id="directions" aria-labelledby="landing-directions-title"><div className="landing-section-heading"><div><span className="landing-section-label">ВОЗМОЖНОСТИ</span><h2 id="landing-directions-title">Направления отбора</h2></div><p>Выберите то, что ближе вам. Направление указывается при заполнении анкеты.</p></div><div className="landing-direction-list">{DIRECTIONS.map(({ id, label }) => <span key={id}>{label}</span>)}</div></section>
    </main>
  </>;
}
