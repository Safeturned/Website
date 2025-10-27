'use client';

import { useTranslation } from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PrivacyPage() {
    const { t } = useTranslation();
    const params = useParams();
    const locale = params.locale as string;

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
            <nav className='px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm'>
                <div className='max-w-6xl mx-auto flex justify-between items-center'>
                    <Link href={`/${locale}`} className='flex items-center space-x-3'>
                        <div className='w-10 h-10'>
                            <Image
                                src='/favicon.jpg'
                                alt='Safeturned Logo'
                                width={40}
                                height={40}
                                className='w-full h-full object-contain rounded-lg'
                            />
                        </div>
                        <span className='text-xl font-bold'>{t('hero.title')}</span>
                    </Link>
                    <div className='flex items-center space-x-4'>
                        <a
                            href='https://github.com/Safeturned/Website'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center'
                            title='View on GitHub'
                        >
                            <svg
                                className='w-5 h-5 group-hover:rotate-12 transition-all duration-300'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                            </svg>
                        </a>
                        <a
                            href='https://discord.gg/JAKWGEabhc'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center'
                            title='Join our Discord Community'
                        >
                            <svg
                                className='w-5 h-5 group-hover:rotate-12 transition-all duration-300'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path d='M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z' />
                            </svg>
                        </a>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            <div className='max-w-4xl mx-auto px-6 py-8'>
                <div className='bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8'>
                    <h1 className='text-3xl font-bold mb-8 text-center'>
                        Политика конфиденциальности
                    </h1>

                    <div className='space-y-6 text-gray-300'>
                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>1. Введение</h2>
                            <p>
                                Эта Политика конфиденциальности объясняет, как Safeturned собирает,
                                использует и защищает вашу информацию при использовании нашего
                                сервиса анализа безопасности. Мы стремимся защищать вашу
                                конфиденциальность и быть прозрачными в отношении наших практик
                                работы с данными.
                            </p>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                2. Информация, которую мы НЕ собираем
                            </h2>
                            <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4'>
                                <h3 className='font-semibold text-red-300 mb-2'>
                                    Важно: Мы НЕ храним ваши файлы плагинов
                                </h3>
                                <ul className='list-disc list-inside space-y-1 ml-4'>
                                    <li>
                                        <strong>Файлы плагинов (.dll)</strong> - Файлы
                                        обрабатываются в памяти и немедленно удаляются
                                    </li>
                                    <li>
                                        <strong>Содержимое файлов</strong> - Мы никогда не храним
                                        фактический код или содержимое ваших плагинов
                                    </li>
                                    <li>
                                        <strong>Личная информация</strong> - Никаких имен,
                                        email-адресов, адресов или личных идентификаторов
                                    </li>
                                    <li>
                                        <strong>Пользовательские аккаунты</strong> - Регистрация или
                                        вход не требуются
                                    </li>
                                    <li>
                                        <strong>IP-адреса</strong> - Используются только временно
                                        для ограничения скорости, не хранятся
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                3. Информация, которую мы собираем
                            </h2>
                            <div className='bg-green-900/20 border border-green-500/30 rounded-lg p-4'>
                                <h3 className='font-semibold text-green-300 mb-2'>
                                    Метаданные файлов (для целей анализа)
                                </h3>
                                <ul className='list-disc list-inside space-y-1 ml-4'>
                                    <li>
                                        <strong>Хеш файла</strong> - SHA-256 хеш для идентификации
                                        дублирующихся файлов
                                    </li>
                                    <li>
                                        <strong>Имя файла</strong> - Оригинальное имя файла для
                                        справки
                                    </li>
                                    <li>
                                        <strong>Размер файла</strong> - Размер в байтах для анализа
                                    </li>
                                    <li>
                                        <strong>Тип обнаружения</strong> - Тип обнаруженного файла
                                        (например, &ldquo;Assembly&rdquo;)
                                    </li>
                                    <li>
                                        <strong>Результаты сканирования</strong> - Оценка
                                        безопасности и результаты обнаружения угроз
                                    </li>
                                    <li>
                                        <strong>Временные метки сканирования</strong> - Когда файл
                                        был впервые и последний раз просканирован
                                    </li>
                                    <li>
                                        <strong>Количество сканирований</strong> - Сколько раз файл
                                        был проанализирован
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                4. Аналитические данные, которые мы собираем
                            </h2>
                            <p>
                                Мы собираем агрегированные аналитические данные для улучшения нашего
                                сервиса и понимания моделей использования:
                            </p>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Общее количество просканированных файлов</strong> -
                                    Количество обработанных файлов
                                </li>
                                <li>
                                    <strong>Статистика обнаружения угроз</strong> - Количество
                                    обнаруженных угроз vs безопасных файлов
                                </li>
                                <li>
                                    <strong>Точность обнаружения</strong> - Метрики
                                    производительности нашего анализа
                                </li>
                                <li>
                                    <strong>Среднее время сканирования</strong> - Метрики
                                    производительности сервиса
                                </li>
                                <li>
                                    <strong>Средние оценки безопасности</strong> - Общие тенденции
                                    безопасности
                                </li>
                                <li>
                                    <strong>Диапазоны дат сканирования</strong> - Первая и последняя
                                    даты сканирования для аналитики
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                5. Как мы используем вашу информацию
                            </h2>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Анализ безопасности</strong> - Для предоставления
                                    сервисов сканирования безопасности плагинов
                                </li>
                                <li>
                                    <strong>Улучшение сервиса</strong> - Для улучшения наших
                                    алгоритмов обнаружения и производительности
                                </li>
                                <li>
                                    <strong>Обнаружение дубликатов</strong> - Для избежания
                                    повторного анализа одних и тех же файлов
                                </li>
                                <li>
                                    <strong>Ограничение скорости</strong> - Для предотвращения
                                    злоупотреблений и обеспечения справедливого использования
                                </li>
                                <li>
                                    <strong>Мониторинг ошибок</strong> - Для выявления и исправления
                                    технических проблем (без включения содержимого файлов)
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                6. Защита данных
                            </h2>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Отсутствие хранения файлов</strong> - Файлы плагинов
                                    никогда не сохраняются на диск
                                </li>
                                <li>
                                    <strong>Обработка только в памяти</strong> - Файлы
                                    обрабатываются в RAM и немедленно удаляются
                                </li>
                                <li>
                                    <strong>Шифрованная передача</strong> - Все данные передаются по
                                    HTTPS
                                </li>
                                <li>
                                    <strong>Безопасность базы данных</strong> - Только метаданные
                                    хранятся в защищенных базах данных
                                </li>
                                <li>
                                    <strong>Фильтрация логов</strong> - Загрузки файлов фильтруются
                                    из логов ошибок
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                7. Хранение данных
                            </h2>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Метаданные файлов</strong> - Хранятся бессрочно для
                                    обнаружения дубликатов и аналитики
                                </li>
                                <li>
                                    <strong>Записи сканирования</strong> - Хранятся для улучшения
                                    сервиса и аналитики
                                </li>
                                <li>
                                    <strong>Аналитические данные</strong> - Агрегированная
                                    статистика хранится для оптимизации сервиса
                                </li>
                                <li>
                                    <strong>Файлы плагинов</strong> - Никогда не хранятся,
                                    немедленно удаляются после анализа
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                8. Передача данных
                            </h2>
                            <p>
                                Мы не продаем, не обмениваем и не передаем вашу информацию третьим
                                лицам. Мы можем делиться:
                            </p>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Агрегированной аналитикой</strong> - Публичная
                                    статистика (без данных отдельных файлов)
                                </li>
                                <li>
                                    <strong>Поставщиками услуг</strong> - Только для технической
                                    инфраструктуры (без содержимого файлов)
                                </li>
                                <li>
                                    <strong>Юридическими требованиями</strong> - Только если
                                    требуется по закону (крайне маловероятно, учитывая наши практики
                                    работы с данными)
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>9. Ваши права</h2>
                            <p>
                                Поскольку мы не собираем личную информацию, традиционные права на
                                конфиденциальность не применяются. Однако вы можете:
                            </p>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Прекратить использование сервиса</strong> - Аккаунт не
                                    требуется, просто прекратите загружать файлы
                                </li>
                                <li>
                                    <strong>Связаться с нами</strong> - Для вопросов о наших
                                    практиках конфиденциальности
                                </li>
                                <li>
                                    <strong>Просмотреть наш код</strong> - Весь код открыт и
                                    публично доступен
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                10. Прозрачность открытого исходного кода
                            </h2>
                            <p>Safeturned полностью открыт. Вы можете:</p>
                            <ul className='list-disc list-inside space-y-2 ml-4'>
                                <li>
                                    <strong>Просмотреть наш код</strong> - Весь исходный код
                                    публично доступен на GitHub
                                </li>
                                <li>
                                    <strong>Проверить наши практики</strong> - Проверить нашу
                                    фактическую реализацию обработки данных
                                </li>
                                <li>
                                    <strong>Внести вклад</strong> - Помочь улучшить наши практики
                                    конфиденциальности и безопасности
                                </li>
                                <li>
                                    <strong>Самостоятельно разместить</strong> - Запустить свой
                                    собственный экземпляр, если предпочитаете
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                11. Изменения в этом уведомлении
                            </h2>
                            <p>
                                Мы можем время от времени обновлять эту Политику конфиденциальности.
                                Изменения будут размещены на этой странице с обновленной датой.
                                Продолжение использования сервиса означает принятие обновленного
                                уведомления.
                            </p>
                        </section>

                        <section>
                            <h2 className='text-xl font-semibold mb-3 text-white'>
                                12. Контактная информация
                            </h2>
                            <p>
                                Если у вас есть вопросы об этой Политике конфиденциальности или
                                наших практиках работы с данными, пожалуйста, свяжитесь с нами через
                                наш GitHub репозиторий или другие официальные каналы.
                            </p>
                        </section>

                        <div className='mt-8 pt-6 border-t border-purple-500/30'>
                            <p className='text-sm text-gray-400'>
                                <strong>Последнее обновление:</strong>{' '}
                                {new Date().toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    </div>

                    <div className='mt-8 text-center'>
                        <Link
                            href={`/${locale}`}
                            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300'
                        >
                            Вернуться на главную
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
