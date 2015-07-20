<?php
/**
 * Internationalisation for TimedText
 *
 * @file
 * @ingroup Extensions
 */

$messages = array();

$messages['en'] = array(
	'mwe-timedtext-editor' => 'Timed text editor',
	'mwe-timedtext-stage-transcribe' => 'Transcribe',
	'mwe-timedtext-stage-sync' => 'Sync',
	'mwe-timedtext-stage-translate' => 'Translate',
	'mwe-timedtext-stage-upload' => 'Upload from local file',
	'mwe-timedtext-select-language' => 'Select language',
	'mwe-timedtext-file-language' => 'Subtitle file language',
	'mwe-timedtext-back-btn' => 'Back',
	'mwe-timedtext-choose-text' => 'Choose text',
	'mwe-timedtext-upload-timed-text' => 'Add subtitles',
	'mwe-timedtext-loading-text-edit' => 'Loading timed text editor',
	'mwe-timedtext-search' => 'Search clip',
	'mwe-timedtext-layout' => 'Layout',
	'mwe-timedtext-layout-ontop' => 'On top of video',
	'mwe-timedtext-layout-below' => 'Below video',
	'mwe-timedtext-layout-off' => 'Hide subtitles',
	'mwe-timedtext-loading-text' => 'Loading text ...',
	'mwe-timedtext-key-language' => '$1, $2',
	'mwe-timedtext-textcat-cc' => 'Captions',
	'mwe-timedtext-textcat-sub' => 'Subtitles',
	'mwe-timedtext-textcat-tad' => 'Audio description',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Ticker text',
	'mwe-timedtext-textcat-ar' => 'Active regions',
	'mwe-timedtext-textcat-nb' => 'Annotation',
	'mwe-timedtext-textcat-meta' => 'Timed metadata',
	'mwe-timedtext-textcat-trx' => 'Transcript',
	'mwe-timedtext-textcat-lrc' => 'Lyrics',
	'mwe-timedtext-textcat-lin' => 'Linguistic markup',
	'mwe-timedtext-textcat-cue' => 'Cue points',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 subtitles for clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'No $1 subtitles were found for clip: $2',
	'mwe-timedtext-request-subs' => 'Request transcription',
	'mwe-timedtext-no-subs' => 'No text tracks available',
	'mwe-timedtext-request-subs-desc' => 'Add a request for this video file to be transcribed',
	'mwe-timedtext-request-subs-done' => 'Transcription request added. [$1 See all transcribe requests]',
	'mwe-timedtext-request-subs-fail' => 'Failed to add transcription request. Are you logged in?',
	'mwe-timedtext-request-already-done' => 'A transcription of this video has already been requested. [$1 See all transcribe requests]',
);

/** Message documentation (Message documentation)
 * @author EugeneZelenko
 * @author Shirayuki
 * @author Siebrand
 * @author Umherirrender
 */
$messages['qqq'] = array(
	'mwe-timedtext-stage-transcribe' => 'Unused at this time.',
	'mwe-timedtext-stage-sync' => 'Unused at this time.',
	'mwe-timedtext-stage-translate' => 'Unused at this time.
{{Identical|Translate}}',
	'mwe-timedtext-stage-upload' => 'Unused at this time.',
	'mwe-timedtext-select-language' => '{{Identical|Select language}}',
	'mwe-timedtext-back-btn' => '{{Identical|Back}}',
	'mwe-timedtext-layout' => '{{Identical|Layout}}',
	'mwe-timedtext-key-language' => '{{optional}}
Parameters:
* $1 - language key. e.g. "en"
* $2 - language name',
	'mwe-timedtext-textcat-cc' => '{{Identical|Caption}}',
	'mwe-timedtext-textcat-sub' => '{{Identical|Subtitle}}',
	'mwe-timedtext-textcat-ktv' => 'See [[w:Karaoke]].',
	'mwe-timedtext-textcat-nb' => '{{Identical|Annotation}}',
	'mwe-timedtext-language-subtitles-for-clip' => 'Used as page title, if the subtitles exist. Parameters:
Parameters:
* $1 - a language name, or a language code (if the language name not defined)
* $2 - a video title
See also:
* {{msg-mw|Mwe-timedtext-language-no-subtitles-for-clip}}',
	'mwe-timedtext-language-no-subtitles-for-clip' => "Used as page title, if the subtitles don't exist. Parameters:
* $1 - a language name, or a language code (if the language name not defined)
* $2 - a video title
See also:
* {{msg-mw|Mwe-timedtext-language-subtitles-for-clip}}",
	'mwe-timedtext-request-subs-done' => 'Unused at this time. Parameters:
* $1 - full URL',
	'mwe-timedtext-request-already-done' => 'Unused at this time. Parameters:
* $1 - full URL',
);

/** Afrikaans (Afrikaans)
 * @author Naudefj
 */
$messages['af'] = array(
	'mwe-timedtext-stage-translate' => 'Vertaal',
	'mwe-timedtext-select-language' => 'Kies taal',
	'mwe-timedtext-back-btn' => 'Terug',
	'mwe-timedtext-choose-text' => 'Kies teks',
	'mwe-timedtext-layout' => 'Uitleg',
	'mwe-timedtext-textcat-cc' => 'Onderskrifte',
	'mwe-timedtext-textcat-lrc' => 'Lirieke',
);

/** Arabic (العربية)
 * @author Meno25
 * @author روخو
 */
$messages['ar'] = array(
	'mwe-timedtext-stage-transcribe' => 'دون',
	'mwe-timedtext-stage-sync' => 'تزامن',
	'mwe-timedtext-stage-translate' => 'ترجمة',
	'mwe-timedtext-stage-upload' => 'رفع من ملف محلي',
	'mwe-timedtext-select-language' => 'اختر اللغة',
	'mwe-timedtext-file-language' => 'عنوان ملف اللغة الفرعي',
	'mwe-timedtext-back-btn' => 'رجوع',
	'mwe-timedtext-choose-text' => 'اختر نص',
	'mwe-timedtext-upload-timed-text' => 'إضافة الترجمات',
	'mwe-timedtext-search' => 'البحث عن مقطع',
	'mwe-timedtext-layout' => 'مخرجات',
	'mwe-timedtext-layout-ontop' => 'في أعلى الفيديو',
	'mwe-timedtext-layout-off' => 'إخفاء الترجمات',
	'mwe-timedtext-loading-text' => 'جاري تحميل النص...',
	'mwe-timedtext-textcat-cc' => 'نصوص توضيحية',
	'mwe-timedtext-textcat-cue' => 'نقاط تلميح',
);

/** Asturian (asturianu)
 * @author Xuacu
 */
$messages['ast'] = array(
	'mwe-timedtext-editor' => 'Editor de testu cronometráu',
	'mwe-timedtext-stage-transcribe' => 'Trescribir',
	'mwe-timedtext-stage-sync' => 'Sincronizar',
	'mwe-timedtext-stage-translate' => 'Traducir',
	'mwe-timedtext-stage-upload' => 'Subir dende un ficheru llocal',
	'mwe-timedtext-select-language' => 'Escoyer llingua',
	'mwe-timedtext-file-language' => 'Llingua del ficheru de subtítulos',
	'mwe-timedtext-back-btn' => 'Anterior',
	'mwe-timedtext-choose-text' => 'Escoyer testu',
	'mwe-timedtext-upload-timed-text' => 'Añadir subtítulos',
	'mwe-timedtext-loading-text-edit' => "Cargando l'editor de testu cronometráu",
	'mwe-timedtext-search' => 'Buscar clip',
	'mwe-timedtext-layout' => 'Diseñu',
	'mwe-timedtext-layout-ontop' => 'Na parte superior del videu',
	'mwe-timedtext-layout-below' => 'Na parte inferior del videu',
	'mwe-timedtext-layout-off' => 'Tapecer subtítulos',
	'mwe-timedtext-loading-text' => "Cargando'l testu...",
	'mwe-timedtext-textcat-cc' => 'Lleendes',
	'mwe-timedtext-textcat-sub' => 'Subtítulos',
	'mwe-timedtext-textcat-tad' => 'Descripción del soníu',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Testu en movimientu',
	'mwe-timedtext-textcat-ar' => 'Rexones actives',
	'mwe-timedtext-textcat-nb' => 'Anotación',
	'mwe-timedtext-textcat-meta' => 'Metadatos cronometraos',
	'mwe-timedtext-textcat-trx' => 'Trescripción',
	'mwe-timedtext-textcat-lrc' => 'Lletra',
	'mwe-timedtext-textcat-lin' => 'Formatu llingüísticu',
	'mwe-timedtext-textcat-cue' => 'Puntos de referencia',
	'mwe-timedtext-language-subtitles-for-clip' => 'Subtítulos en $1 pal videu: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => "Nun s'alcontraron los subtítulos en $1 pal videu: $2",
	'mwe-timedtext-request-subs' => 'Solicitar trescripción',
	'mwe-timedtext-no-subs' => 'Nun hai pistes de testu disponibles',
	'mwe-timedtext-request-subs-desc' => "Añadir una solicitú de trescripción d'esti ficheru de videu",
	'mwe-timedtext-request-subs-done' => 'Solicitú de trescripción añadida. [$1 Ver toles solicitúes de trescripción]',
	'mwe-timedtext-request-subs-fail' => 'Nun pudo añadise la solicitú de trescripción. ¿Anició sesión?',
	'mwe-timedtext-request-already-done' => "Yá se solicitó una trescripción d'esti videu. [$1 Ver toles solicitúes de trescripción]",
);

/** Belarusian (Taraškievica orthography) (беларуская (тарашкевіца)‎)
 * @author EugeneZelenko
 * @author Jim-by
 * @author Wizardist
 */
$messages['be-tarask'] = array(
	'mwe-timedtext-editor' => 'Рэдактар сынхранізаванага тэксту',
	'mwe-timedtext-stage-transcribe' => 'Пераўтвараць',
	'mwe-timedtext-stage-sync' => 'Сынхранізаваць',
	'mwe-timedtext-stage-translate' => 'Перакласьці',
	'mwe-timedtext-stage-upload' => 'Загрузіць з лякальнага файла',
	'mwe-timedtext-select-language' => 'Выберыце мову',
	'mwe-timedtext-file-language' => 'Мова файла субтытраў',
	'mwe-timedtext-back-btn' => 'Вярнуцца',
	'mwe-timedtext-choose-text' => 'Выберыце тэкст',
	'mwe-timedtext-upload-timed-text' => 'Дадаць субтытры',
	'mwe-timedtext-loading-text-edit' => 'Загрузка рэдактара сынхранізаванага тэксту',
	'mwe-timedtext-search' => 'Пошук кліпу',
	'mwe-timedtext-layout' => 'Разьмяшчэньне',
	'mwe-timedtext-layout-ontop' => 'На версе відэа',
	'mwe-timedtext-layout-below' => 'Унізе відэа',
	'mwe-timedtext-layout-off' => 'Схаваць субтытры',
	'mwe-timedtext-loading-text' => 'Загрузка тэксту…',
	'mwe-timedtext-textcat-cc' => 'Субтытры',
	'mwe-timedtext-textcat-sub' => 'Субтытры:',
	'mwe-timedtext-textcat-tad' => 'Аўдыя-апісаньне',
	'mwe-timedtext-textcat-ktv' => 'Караоке',
	'mwe-timedtext-textcat-tik' => 'Тэкставыя карткі',
	'mwe-timedtext-textcat-ar' => 'Актыўныя рэгіёны',
	'mwe-timedtext-textcat-nb' => 'Анатацыя',
	'mwe-timedtext-textcat-meta' => 'Сынхранізаваныя мета-зьвесткі',
	'mwe-timedtext-textcat-trx' => 'Стэнаграма',
	'mwe-timedtext-textcat-lrc' => 'Словы',
	'mwe-timedtext-textcat-lin' => 'Лінгвістычная разьметка',
	'mwe-timedtext-textcat-cue' => 'Сыгнальныя кропкі',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 субтытры для кліпу: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Субтытры $1 для кліпу ня знойдзеныя: $2',
	'mwe-timedtext-request-subs' => 'Запытаць транскрыпцыю',
	'mwe-timedtext-no-subs' => 'Субтытраў няма',
	'mwe-timedtext-request-subs-desc' => 'Дадаць запыт на транскрыпцыю гэтага відэа',
	'mwe-timedtext-request-subs-done' => 'Запыт на транскрыпцыю зроблены. [$1 Усе запыты на транскрыпцыю]',
	'mwe-timedtext-request-subs-fail' => 'Немагчыма дадаць запыт на транскрыпцыю. Ці ўвайшлі Вы ў сыстэму?',
	'mwe-timedtext-request-already-done' => 'Запыт на транскрыпцыю відэа ўжо быў пададзены. [$1 Усе запыты на транскрыпцыю]',
);

/** Bulgarian (български)
 * @author පසිඳු කාවින්ද
 */
$messages['bg'] = array(
	'mwe-timedtext-back-btn' => 'Назад',
);

/** Bengali (বাংলা)
 * @author Aftab1995
 * @author Bellayet
 */
$messages['bn'] = array(
	'mwe-timedtext-editor' => 'টাইমড টেক্সট এডিটর',
	'mwe-timedtext-stage-transcribe' => 'লিপিবদ্ধ',
	'mwe-timedtext-stage-sync' => 'সিঙ্ক করুন',
	'mwe-timedtext-stage-translate' => 'অনুবাদ',
	'mwe-timedtext-stage-upload' => 'স্থানীয় ফাইল থেকে আপলোড করুন',
	'mwe-timedtext-select-language' => 'ভাষা নির্বাচন',
	'mwe-timedtext-file-language' => 'ভাষার উপশিরোনাম ফাইল',
	'mwe-timedtext-back-btn' => 'পিছনে',
	'mwe-timedtext-choose-text' => 'টেক্সট নির্বাচন করুন',
	'mwe-timedtext-upload-timed-text' => 'উপশিরোনাম যুক্ত করুন',
	'mwe-timedtext-loading-text-edit' => 'টাইমড টেক্সট এডিটর লোড করা হচ্ছে',
	'mwe-timedtext-search' => 'ক্লিপ অনুসন্ধান',
	'mwe-timedtext-layout' => 'বহির্বিন্যাস',
	'mwe-timedtext-layout-ontop' => 'ভিডিওর উপরে',
	'mwe-timedtext-layout-below' => 'ভিডিওর নীচে',
	'mwe-timedtext-layout-off' => 'উপশিরোনাম লুকাও',
	'mwe-timedtext-loading-text' => 'টেক্সট লোড হচ্ছে ...',
	'mwe-timedtext-textcat-cc' => 'পরিচয়লিপি',
	'mwe-timedtext-textcat-sub' => 'উপশিরোনাম',
	'mwe-timedtext-textcat-tad' => 'অডিও বিবরণ',
);

/** Breton (brezhoneg)
 * @author Fulup
 * @author Y-M D
 */
$messages['br'] = array(
	'mwe-timedtext-editor' => 'Embanner testennoù sinkronelaet',
	'mwe-timedtext-stage-transcribe' => 'Treuzskrivañ',
	'mwe-timedtext-stage-sync' => 'Kempredañ',
	'mwe-timedtext-stage-translate' => 'Treiñ',
	'mwe-timedtext-stage-upload' => "Kargañ eus ur restr lec'hel",
	'mwe-timedtext-select-language' => 'Dibab ar yezh',
	'mwe-timedtext-file-language' => 'Yezh ar restr istitloù',
	'mwe-timedtext-back-btn' => 'Distreiñ',
	'mwe-timedtext-choose-text' => 'Dibab an destenn',
	'mwe-timedtext-upload-timed-text' => 'Enporzhiañ istitloù', # Fuzzy
	'mwe-timedtext-loading-text-edit' => 'O kargañ an embanner testennoù sinkronelaet',
	'mwe-timedtext-search' => "Klask ar c'hlip",
	'mwe-timedtext-layout' => 'Pajennaozañ',
	'mwe-timedtext-layout-ontop' => 'E penn ar video',
	'mwe-timedtext-layout-below' => 'Dindan ar video',
	'mwe-timedtext-layout-off' => 'Kuzhat an istitloù',
	'mwe-timedtext-loading-text' => 'O kargañ an destenn...',
	'mwe-timedtext-textcat-cc' => "Alc'hwezioù",
	'mwe-timedtext-textcat-sub' => 'Istitloù',
	'mwe-timedtext-textcat-tad' => 'Deskrivadur son',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Barenn titouroù',
	'mwe-timedtext-textcat-ar' => 'Rannvroioù oberiant',
	'mwe-timedtext-textcat-nb' => 'Notennadur',
	'mwe-timedtext-textcat-meta' => 'Metaroadennoù sinkronelaet',
	'mwe-timedtext-textcat-trx' => 'Treuzskrivañ',
	'mwe-timedtext-textcat-lrc' => 'Komzoù',
	'mwe-timedtext-textcat-lin' => 'Balizennoù yezhel',
	'mwe-timedtext-textcat-cue' => "Poent lec'hiañ",
	'mwe-timedtext-language-subtitles-for-clip' => "$1 istitl evit ar c'hlip : $2",
	'mwe-timedtext-language-no-subtitles-for-clip' => "N'eo ket bet kavet $1 istitl evit ar c'hlip : $2",
	'mwe-timedtext-request-subs' => 'Goulenn treuzkrivadur',
	'mwe-timedtext-request-subs-desc' => 'Goulenn ma vo treuzskrivet ar restr video-mañ',
	'mwe-timedtext-request-subs-done' => "Ouzhpennet eo bet ar goulenn treuzskrivañ. [$1 Gwelet an holl c'houlennoù treuzskrivañ]",
	'mwe-timedtext-request-subs-fail' => "N'eus ket bet gallet ouzhpennañ ar goulenn treuzskrivañ. Ha kevreet oc'h ?",
	'mwe-timedtext-request-already-done' => "Goulennet eo bet treuzskrivañ ar video-mañ c'hoazh. [$1 Gwelet an holl c'houlennoù treuzskrivañ]",
);

/** Bosnian (bosanski)
 * @author CERminator
 */
$messages['bs'] = array(
	'mwe-timedtext-stage-translate' => 'Prevedi',
	'mwe-timedtext-stage-upload' => 'Postavljanje iz lokalne datoteke',
	'mwe-timedtext-select-language' => 'Odaberi jezik',
	'mwe-timedtext-back-btn' => 'Nazad',
	'mwe-timedtext-textcat-sub' => 'Podnaslovi',
	'mwe-timedtext-textcat-tad' => 'Opis zvuka',
);

/** Catalan (català)
 * @author Pitort
 */
$messages['ca'] = array(
	'mwe-timedtext-stage-translate' => 'Tradueix',
	'mwe-timedtext-back-btn' => 'Enrere',
	'mwe-timedtext-textcat-sub' => 'Subtítols',
);

/** Chechen (нохчийн)
 * @author Умар
 */
$messages['ce'] = array(
	'mwe-timedtext-stage-translate' => 'Гоч',
	'mwe-timedtext-search' => 'Лаха клип',
);

/** Czech (česky)
 * @author Mormegil
 * @author Vks
 */
$messages['cs'] = array(
	'mwe-timedtext-editor' => 'Editor titulků',
	'mwe-timedtext-stage-transcribe' => 'Přepis',
	'mwe-timedtext-stage-sync' => 'Synchronizace',
	'mwe-timedtext-stage-translate' => 'Překlad',
	'mwe-timedtext-stage-upload' => 'Načtení místního souboru',
	'mwe-timedtext-select-language' => 'Vyberte jazyk',
	'mwe-timedtext-file-language' => 'Jazyk titulků',
	'mwe-timedtext-back-btn' => 'Zpět',
	'mwe-timedtext-choose-text' => 'Zvolit text',
	'mwe-timedtext-loading-text-edit' => 'Načítá se editor titulků',
	'mwe-timedtext-layout' => 'Vzhled',
	'mwe-timedtext-layout-ontop' => 'Přes obraz',
	'mwe-timedtext-layout-below' => 'Pod obrazem',
	'mwe-timedtext-layout-off' => 'Skrýt titulky',
	'mwe-timedtext-loading-text' => 'Načítá se text…',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-nb' => 'Anotace',
	'mwe-timedtext-textcat-trx' => 'Přepis',
	'mwe-timedtext-language-subtitles-for-clip' => 'Titulky ke klipu $2 v jazyce $1',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Ke klipu $2 nebyly nalezeny titulky v jazyce $1',
);

/** Welsh (Cymraeg)
 * @author Lloffiwr
 */
$messages['cy'] = array(
	'mwe-timedtext-editor' => 'Golygydd cydamseru testun',
	'mwe-timedtext-stage-transcribe' => 'Adysgrifio',
	'mwe-timedtext-stage-sync' => 'Cydamseru',
	'mwe-timedtext-stage-translate' => 'Cyfieithu',
	'mwe-timedtext-stage-upload' => 'Uwchlwytho o ffeil leol',
	'mwe-timedtext-select-language' => 'Dewis iaith',
	'mwe-timedtext-file-language' => 'Iaith y ffeil isdeitlau',
	'mwe-timedtext-back-btn' => 'Yn ôl',
	'mwe-timedtext-choose-text' => 'Dewis y testun',
	'mwe-timedtext-upload-timed-text' => 'Ychwanegu isdeitlau',
);

/** German (Deutsch)
 * @author Kghbln
 * @author Metalhead64
 * @author Purodha
 */
$messages['de'] = array(
	'mwe-timedtext-editor' => 'Ermöglicht die Nutzung des „Timed Text“-Editors',
	'mwe-timedtext-stage-transcribe' => 'Abschrift anfertigen',
	'mwe-timedtext-stage-sync' => 'Synchronisieren',
	'mwe-timedtext-stage-translate' => 'Übersetzen',
	'mwe-timedtext-stage-upload' => 'Aus einer lokalen Datei hochladen',
	'mwe-timedtext-select-language' => 'Sprache auswählen',
	'mwe-timedtext-file-language' => 'Sprache der Untertiteldatei',
	'mwe-timedtext-back-btn' => 'Zurück',
	'mwe-timedtext-choose-text' => 'Text auswählen',
	'mwe-timedtext-upload-timed-text' => 'Untertitel hinzufügen',
	'mwe-timedtext-loading-text-edit' => 'Lade den Editor für „Timed Text“',
	'mwe-timedtext-search' => 'Suche den Videoclip',
	'mwe-timedtext-layout' => 'Ausrichtung',
	'mwe-timedtext-layout-ontop' => 'Oberhalb des Videoclips',
	'mwe-timedtext-layout-below' => 'Unterhalb des Videoclips',
	'mwe-timedtext-layout-off' => 'Untertitel ausblenden',
	'mwe-timedtext-loading-text' => 'Text wird geladen …',
	'mwe-timedtext-textcat-cc' => 'Legenden',
	'mwe-timedtext-textcat-sub' => 'Untertitel',
	'mwe-timedtext-textcat-tad' => 'Beschreibung (Audio)',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Text-Ticker',
	'mwe-timedtext-textcat-ar' => 'Aktive Regionen',
	'mwe-timedtext-textcat-nb' => 'Annotation',
	'mwe-timedtext-textcat-meta' => '„Timed Text“-Metadaten',
	'mwe-timedtext-textcat-trx' => 'Abschrift',
	'mwe-timedtext-textcat-lrc' => 'Liedtext',
	'mwe-timedtext-textcat-lin' => 'Sprachliche Beschreibung',
	'mwe-timedtext-textcat-cue' => 'Cue-Punkte',
	'mwe-timedtext-language-subtitles-for-clip' => 'Untertitel auf $1 für den Videoclip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Keine Untertitel auf $1 für den Videoclip gefunden: $2',
	'mwe-timedtext-request-subs' => 'Untertitelung erbitten',
	'mwe-timedtext-no-subs' => 'Es sind keine Untertitel verfügbar',
	'mwe-timedtext-request-subs-desc' => 'Bitte zur Untertitelung dieses Videos hinzufügen',
	'mwe-timedtext-request-subs-done' => 'Bitte zur Untertitelung wurde hinzugefügt. [$1 Alle Bitten zur Untertitelung ansehen]',
	'mwe-timedtext-request-subs-fail' => 'Bitte zur Untertitelung konnte nicht hinzugefügt werden. Angemeldet?',
	'mwe-timedtext-request-already-done' => 'Eine Bitte zur Untertitelung dieses Videos liegt bereits vor. [$1 Alle Bitten zur Untertitelung ansehen]',
);

/** German (formal address) (Deutsch (Sie-Form)‎)
 * @author Kghbln
 */
$messages['de-formal'] = array(
	'mwe-timedtext-upload-text-desc-help-browse' => 'Durchsuchen Sie Ihren lokalen Computer nach der SRT-Datei, die Sie hochladen möchten',
	'mwe-timedtext-upload-text-desc-help-select' => 'Wählen Sie die Sprache der Datei',
	'mwe-timedtext-upload-text-desc-help-review' => 'Sehen Sie den Text durch und bearbeiten Sie ihn gegebenenfalls, bevor Sie ihn mit einem Klick auf Hochladen hinzufügen',
);

/** Zazaki (Zazaki)
 * @author Erdemaslancan
 * @author Mirzali
 */
$messages['diq'] = array(
	'mwe-timedtext-stage-sync' => 'Sync',
	'mwe-timedtext-stage-translate' => 'Açarne',
	'mwe-timedtext-back-btn' => 'Peyser',
	'mwe-timedtext-layout' => 'Ca gınayiş',
	'mwe-timedtext-textcat-cc' => 'Bınnuşte',
	'mwe-timedtext-textcat-sub' => 'Bın name',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-nb' => 'Ole şınasiye',
);

/** Lower Sorbian (dolnoserbski)
 * @author Michawiki
 */
$messages['dsb'] = array(
	'mwe-timedtext-editor' => 'Editor za synchronizěrowany tekst',
	'mwe-timedtext-stage-transcribe' => 'Pśepisaś',
	'mwe-timedtext-stage-sync' => 'Synchronizěrowaś',
	'mwe-timedtext-stage-translate' => 'Pśełožyś',
	'mwe-timedtext-stage-upload' => 'Z lokalneje dataje nagraś',
	'mwe-timedtext-select-language' => 'Rěc wubraś',
	'mwe-timedtext-file-language' => 'Rěc dataje pódtitela',
	'mwe-timedtext-back-btn' => 'Slědk',
	'mwe-timedtext-choose-text' => 'Tekst wubraś',
	'mwe-timedtext-upload-timed-text' => 'Pódtitele pśidaś',
	'mwe-timedtext-loading-text-edit' => 'Editor za synchronizěrowany tekst se startujo',
	'mwe-timedtext-search' => 'Klip pytaś',
	'mwe-timedtext-layout' => 'Wusměrjenje',
	'mwe-timedtext-layout-ontop' => 'Nad wideo',
	'mwe-timedtext-layout-below' => 'Pód wideo',
	'mwe-timedtext-layout-off' => 'Pódtitele schowaś',
	'mwe-timedtext-loading-text' => 'Tekst se zacytujo...',
	'mwe-timedtext-textcat-cc' => 'Wopisanja',
	'mwe-timedtext-textcat-sub' => 'Pódtitele',
	'mwe-timedtext-textcat-tad' => 'Awdiowopisanje',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Běžecy tekst',
	'mwe-timedtext-textcat-ar' => 'Aktiwne regiony',
	'mwe-timedtext-textcat-nb' => 'Anotacija',
	'mwe-timedtext-textcat-meta' => 'Synchronizěrowane metadaty',
	'mwe-timedtext-textcat-trx' => 'Pśepisaś',
	'mwe-timedtext-textcat-lrc' => 'Spiwny tekst',
	'mwe-timedtext-textcat-lin' => 'Rěcywědne wopisanje',
	'mwe-timedtext-textcat-cue' => 'Zastupne dypki',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 {{PLURAL:$1|pódtitel|pódtitela|pódtitele|oódtitelow}} za klip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Žedne pódtitele $1 su se za klip namakali: $2',
	'mwe-timedtext-request-subs' => 'Transkripciju pominaś',
	'mwe-timedtext-no-subs' => 'Žedne pódtitele k dispoziciji',
	'mwe-timedtext-request-subs-desc' => 'Póžedanje na transkripciju toś teje wideojoweje dataje pśidaś',
	'mwe-timedtext-request-subs-done' => 'Póžedanje na transkripciju pśidane. [$1 Glědaj wšykne póžedanja na transkripciju]',
	'mwe-timedtext-request-subs-fail' => 'Pśidawanje póžedanja na transkripciju jo se njeraźiło. Sy se pśizjawił?',
	'mwe-timedtext-request-already-done' => 'Póžedanje na transkripcija toś togo widea jo se južo stajiło. [$1 Glědaj wšykne póžedanja na transkripciju]',
);

/** Greek (Ελληνικά)
 * @author Geraki
 */
$messages['el'] = array(
	'mwe-timedtext-editor' => 'Επεξεργαστής χρονισμένου κειμένου',
	'mwe-timedtext-stage-transcribe' => 'Μεταγραφή',
	'mwe-timedtext-stage-sync' => 'Συγχρονισμός',
	'mwe-timedtext-stage-translate' => 'Μετάφραση',
	'mwe-timedtext-stage-upload' => 'Φορτώστε από τοπικό αρχείο',
	'mwe-timedtext-select-language' => 'Επιλογή γλώσσας',
	'mwe-timedtext-file-language' => 'Όνομα αρχείου γλώσσας',
	'mwe-timedtext-back-btn' => 'Επιστροφή',
	'mwe-timedtext-choose-text' => 'Επιλέξτε το κείμενο',
	'mwe-timedtext-loading-text-edit' => 'Φόρτωση επεξεργαστή χρονισμένου κειμένου',
	'mwe-timedtext-search' => 'Αναζήτηση βίντεο',
	'mwe-timedtext-layout' => 'Διάταξη',
	'mwe-timedtext-layout-ontop' => 'Στην κορυφή του βίντεο',
	'mwe-timedtext-layout-below' => 'Κάτω από το βίντεο',
	'mwe-timedtext-layout-off' => 'Απόκρυψη υπότιτλων',
	'mwe-timedtext-loading-text' => 'Φόρτωση κείμενου...',
	'mwe-timedtext-textcat-cc' => 'Λεζάντες',
	'mwe-timedtext-textcat-sub' => 'Υπότιτλοι',
	'mwe-timedtext-textcat-tad' => 'Ακουστική περιγραφή',
	'mwe-timedtext-textcat-ktv' => 'Καραόκε',
	'mwe-timedtext-textcat-tik' => 'Κυλιόμενο κείμενο',
	'mwe-timedtext-textcat-ar' => 'Ενεργές περιοχές',
	'mwe-timedtext-textcat-nb' => 'Σχόλιο',
	'mwe-timedtext-textcat-meta' => 'Χρονισμένα μεταδεδομένα',
	'mwe-timedtext-textcat-trx' => 'Μεταγραφή',
	'mwe-timedtext-textcat-lrc' => 'Στίχοι',
	'mwe-timedtext-textcat-lin' => 'Γλωσσολογική σύνταξη',
	'mwe-timedtext-textcat-cue' => 'Cue points',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 υπότιτλοι για το βίντεο: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Δεν βρέθηκαν υπότιτλοι $1 για το βίντεο: $2',
);

/** Esperanto (Esperanto)
 * @author Yekrats
 */
$messages['eo'] = array(
	'mwe-timedtext-upload-text-fail-title' => 'Alŝutado malsukcesis',
	'mwe-timedtext-upload-text-another' => 'Alŝuti alian',
	'mwe-timedtext-upload-text-done-uploading' => 'Finiĝis alŝutado',
);

/** Spanish (español)
 * @author Armando-Martin
 * @author Crazymadlover
 * @author Locos epraix
 * @author Pertile
 * @author Translationista
 */
$messages['es'] = array(
	'mwe-timedtext-editor' => 'Editor de texto temporizado',
	'mwe-timedtext-stage-transcribe' => 'Transcribir',
	'mwe-timedtext-stage-sync' => 'Sincronizar',
	'mwe-timedtext-stage-translate' => 'Traducir',
	'mwe-timedtext-stage-upload' => 'Subir desde un archivo local',
	'mwe-timedtext-select-language' => 'Seleccionar idioma',
	'mwe-timedtext-file-language' => 'Idioma del archivo de subtítulo',
	'mwe-timedtext-back-btn' => 'Atrás',
	'mwe-timedtext-choose-text' => 'Escoger texto',
	'mwe-timedtext-upload-timed-text' => 'Añadir subtítulos',
	'mwe-timedtext-loading-text-edit' => 'Cargando el editor de texto sincronizado',
	'mwe-timedtext-search' => 'Buscar clip',
	'mwe-timedtext-layout' => 'Composición:',
	'mwe-timedtext-layout-ontop' => 'En la parte superior del vídeo',
	'mwe-timedtext-layout-below' => 'Debajo del vídeo',
	'mwe-timedtext-layout-off' => 'Ocultar subtítulos',
	'mwe-timedtext-loading-text' => 'Cargando texto ...',
	'mwe-timedtext-textcat-cc' => 'Leyendas',
	'mwe-timedtext-textcat-sub' => 'Subtítulos',
	'mwe-timedtext-textcat-tad' => 'Descripción de audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Texto desplazable',
	'mwe-timedtext-textcat-ar' => 'Regiones activas',
	'mwe-timedtext-textcat-nb' => 'Anotación',
	'mwe-timedtext-textcat-meta' => 'Metadatos sincronizados',
	'mwe-timedtext-textcat-trx' => 'Transcribir',
	'mwe-timedtext-textcat-lrc' => 'Letra',
	'mwe-timedtext-textcat-lin' => 'Marcador lingüístico',
	'mwe-timedtext-textcat-cue' => 'Puntos de referencia',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 subtítulos para el clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'No se ha encontrado subtítulos $1 para el clip: $2',
	'mwe-timedtext-request-subs' => 'Solicitar la transcripción',
	'mwe-timedtext-no-subs' => 'No hay pistas de texto disponibles',
	'mwe-timedtext-request-subs-desc' => 'Añadir una solicitud de transcripción de este archivo de vídeo',
	'mwe-timedtext-request-subs-done' => 'Solicitud de transcripción añadida. [$1 Ver todas las solicitudes de transcripción]',
	'mwe-timedtext-request-subs-fail' => 'Error al añadir la solicitud de transcripción. ¿Ha iniciado sesión?',
	'mwe-timedtext-request-already-done' => 'Ya se solicitó la transcripción de este vídeo. [$1 Ver todas las solicitudes de transcripción]',
);

/** Estonian (eesti)
 * @author Avjoska
 * @author Pikne
 */
$messages['et'] = array(
	'mwe-timedtext-editor' => 'Ajastatud teksti redaktor',
	'mwe-timedtext-file-language' => 'Alltiitrite faili keel',
	'mwe-timedtext-upload-timed-text' => 'Lisa alltiitrid',
	'mwe-timedtext-layout-off' => 'Peida alltiitrid',
	'mwe-timedtext-loading-text' => 'Teksti laadimine...',
	'mwe-timedtext-textcat-sub' => 'Alltiitrid',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-meta' => 'Ajastatud metaandmed',
	'mwe-timedtext-textcat-lrc' => 'Laulusõnad',
	'mwe-timedtext-language-subtitles-for-clip' => 'Lõigu $2 $1 alltiitrid',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Lõigu $2 jaoks ei leitud $1 alltiitreid',
);

/** Basque (euskara)
 * @author පසිඳු කාවින්ද
 */
$messages['eu'] = array(
	'mwe-timedtext-back-btn' => 'Atzera',
);

/** Persian (فارسی)
 * @author Ebraminio
 * @author Pouyana
 * @author پاناروما
 */
$messages['fa'] = array(
	'mwe-timedtext-editor' => 'ویرایشگر متنی زمانی',
	'mwe-timedtext-stage-transcribe' => 'رونویسی',
	'mwe-timedtext-stage-sync' => 'همگام سازی',
	'mwe-timedtext-stage-translate' => 'ترجمه',
	'mwe-timedtext-stage-upload' => 'بارگذاری از پروندۀاصلی',
	'mwe-timedtext-select-language' => 'انتخاب زبان',
	'mwe-timedtext-file-language' => 'زیان پرونده زیرنویس',
	'mwe-timedtext-back-btn' => 'بازگشت',
	'mwe-timedtext-choose-text' => 'انتخاب متن',
	'mwe-timedtext-upload-timed-text' => 'اضافه کردن زیرنویس',
	'mwe-timedtext-loading-text-edit' => 'بارگیری ویرایشگر متنی زمانی',
	'mwe-timedtext-search' => 'جستجوی کلیپ',
	'mwe-timedtext-layout' => 'چیدمان',
	'mwe-timedtext-layout-ontop' => 'بالای ویدئو',
	'mwe-timedtext-layout-below' => 'پایین ویدیو',
	'mwe-timedtext-layout-off' => 'پنهان‌کردن زیرنویس',
	'mwe-timedtext-loading-text' => 'در حال بارگیری متن ...',
	'mwe-timedtext-textcat-cc' => 'عناوین:',
	'mwe-timedtext-textcat-sub' => 'زیرنویس',
	'mwe-timedtext-textcat-tad' => 'توضیح صوتی',
	'mwe-timedtext-textcat-ktv' => 'کارائوکه',
	'mwe-timedtext-textcat-tik' => 'متن تیکر',
	'mwe-timedtext-textcat-lrc' => 'متن ترانه‌ها',
);

/** Finnish (suomi)
 * @author Nedergard
 * @author Nike
 * @author Silvonen
 */
$messages['fi'] = array(
	'mwe-timedtext-stage-translate' => 'Käännä',
	'mwe-timedtext-stage-upload' => 'Lataa paikallisesti tiedostosta',
	'mwe-timedtext-select-language' => 'Valitse kieli',
	'mwe-timedtext-file-language' => 'Tekstitystiedoston kieli',
	'mwe-timedtext-back-btn' => 'Takaisin',
	'mwe-timedtext-choose-text' => 'Valitse teksti',
	'mwe-timedtext-upload-timed-text' => 'Lisää tekstitys',
	'mwe-timedtext-layout-off' => 'Piilota tekstitys',
	'mwe-timedtext-loading-text' => 'Ladataan tekstiä...',
	'mwe-timedtext-textcat-cc' => 'Kuvatekstit',
	'mwe-timedtext-textcat-sub' => 'Tekstitykset',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
);

/** French (français)
 * @author IAlex
 * @author Peter17
 * @author Tititou36
 * @author Verdy p
 */
$messages['fr'] = array(
	'mwe-timedtext-editor' => 'Éditeur de texte synchronisé',
	'mwe-timedtext-stage-transcribe' => 'Transcrire',
	'mwe-timedtext-stage-sync' => 'Synchroniser',
	'mwe-timedtext-stage-translate' => 'Traduire',
	'mwe-timedtext-stage-upload' => 'Téléverser un fichier local',
	'mwe-timedtext-select-language' => 'Sélectionner la langue',
	'mwe-timedtext-file-language' => 'Langue du fichier de sous-titres',
	'mwe-timedtext-back-btn' => 'Arrière',
	'mwe-timedtext-choose-text' => 'Choisissez le texte',
	'mwe-timedtext-upload-timed-text' => 'Ajouter des sous-titres',
	'mwe-timedtext-loading-text-edit' => "Chargement de l'éditeur de texte synchronisé",
	'mwe-timedtext-search' => 'Recherche un clip',
	'mwe-timedtext-layout' => 'Disposition',
	'mwe-timedtext-layout-ontop' => 'En haut de la vidéo',
	'mwe-timedtext-layout-below' => 'En dessous de la vidéo',
	'mwe-timedtext-layout-off' => 'Masquer les sous-titres',
	'mwe-timedtext-loading-text' => 'Chargement du texte ...',
	'mwe-timedtext-textcat-cc' => 'Légendes',
	'mwe-timedtext-textcat-sub' => 'Sous-titres',
	'mwe-timedtext-textcat-tad' => 'Description audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoké',
	'mwe-timedtext-textcat-tik' => "Barre d'informations",
	'mwe-timedtext-textcat-ar' => 'Régions actives',
	'mwe-timedtext-textcat-nb' => 'Annotation',
	'mwe-timedtext-textcat-meta' => 'métadonnées synchronisées',
	'mwe-timedtext-textcat-trx' => 'Transcription',
	'mwe-timedtext-textcat-lrc' => 'Paroles',
	'mwe-timedtext-textcat-lin' => 'Balisage linguistique',
	'mwe-timedtext-textcat-cue' => 'Points de repère',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 sous-titres pour clip : $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => "Aucun sous-titre $1 n'a été trouvé pour le clip : $2",
	'mwe-timedtext-request-subs' => 'Demande de transcription',
	'mwe-timedtext-no-subs' => 'Aucun texte de piste disponible',
	'mwe-timedtext-request-subs-desc' => 'Ajouter une demande de transcription de ce fichier vidéo',
	'mwe-timedtext-request-subs-done' => 'Demande de transcription ajoutée. [$1 Voir toutes demandes de transcription]',
	'mwe-timedtext-request-subs-fail' => "Impossible d'ajouter la demande de transcription. Êtes-vous connecté ?",
	'mwe-timedtext-request-already-done' => 'Une transcription de cette vidéo a déjà été demandée. [$1 Voir toutes les demandes de transcription]',
);

/** Franco-Provençal (arpetan)
 * @author ChrisPtDe
 */
$messages['frp'] = array(
	'mwe-timedtext-editor' => 'Èditor de tèxto sincronisâ',
	'mwe-timedtext-stage-transcribe' => 'Transcrire',
	'mwe-timedtext-stage-sync' => 'Sincronisar',
	'mwe-timedtext-stage-translate' => 'Traduire',
	'mwe-timedtext-stage-upload' => 'Tèlèchargiér un fichiér local',
	'mwe-timedtext-select-language' => 'Chouèsir la lengoua',
	'mwe-timedtext-file-language' => 'Lengoua du fichiér de sot-titros',
	'mwe-timedtext-back-btn' => 'Tornar',
	'mwe-timedtext-choose-text' => 'Chouèsésséd lo tèxto',
	'mwe-timedtext-upload-timed-text' => 'Apondre des sot-titros',
	'mwe-timedtext-loading-text-edit' => 'Chargement de l’èditor de tèxto sincronisâ',
	'mwe-timedtext-search' => 'Rechèrche un clipe',
	'mwe-timedtext-layout' => 'Misa en pâge',
	'mwe-timedtext-layout-ontop' => 'D’amont la vidèô',
	'mwe-timedtext-layout-below' => 'En-desot de la vidèô',
	'mwe-timedtext-layout-off' => 'Cachiér los sot-titros',
	'mwe-timedtext-loading-text' => 'Chargement du tèxto ...',
	'mwe-timedtext-textcat-cc' => 'Lègendes',
	'mwe-timedtext-textcat-sub' => 'Sot-titros',
	'mwe-timedtext-textcat-tad' => 'Dèscripcion ôdiô',
	'mwe-timedtext-textcat-ktv' => 'Caraoquè',
	'mwe-timedtext-textcat-tik' => 'Bârra d’enformacions',
	'mwe-timedtext-textcat-ar' => 'Règ·ions actives',
	'mwe-timedtext-textcat-nb' => 'Nota',
	'mwe-timedtext-textcat-meta' => 'Mètabalyês sincronisâs',
	'mwe-timedtext-textcat-trx' => 'Transcripcion',
	'mwe-timedtext-textcat-lrc' => 'Paroles',
	'mwe-timedtext-textcat-lin' => 'Balisâjo lengouistico',
	'mwe-timedtext-textcat-cue' => 'Pouents de repèro',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 sot-titros por clipe : $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Nion sot-titro $1 at étâ trovâ por lo clipe : $2',
	'mwe-timedtext-request-subs' => 'Demandar la transcripcion',
	'mwe-timedtext-no-subs' => 'Gins de pista de tèxto disponibla',
);

/** Galician (galego)
 * @author Toliño
 */
$messages['gl'] = array(
	'mwe-timedtext-editor' => 'Editor de textos sincronizados',
	'mwe-timedtext-stage-transcribe' => 'Transcribir',
	'mwe-timedtext-stage-sync' => 'Sincronizar',
	'mwe-timedtext-stage-translate' => 'Traducir',
	'mwe-timedtext-stage-upload' => 'Cargar un ficheiro local',
	'mwe-timedtext-select-language' => 'Seleccionar a lingua',
	'mwe-timedtext-file-language' => 'Lingua do ficheiro de subtítulos',
	'mwe-timedtext-back-btn' => 'Volver',
	'mwe-timedtext-choose-text' => 'Escolla o texto',
	'mwe-timedtext-upload-timed-text' => 'Engadir subtítulos',
	'mwe-timedtext-loading-text-edit' => 'Cargando o editor de texto sincronizado',
	'mwe-timedtext-search' => 'Buscar un vídeo',
	'mwe-timedtext-layout' => 'Disposición',
	'mwe-timedtext-layout-ontop' => 'Na parte superior do vídeo',
	'mwe-timedtext-layout-below' => 'Na parte inferior do vídeo',
	'mwe-timedtext-layout-off' => 'Agochar os subtítulos',
	'mwe-timedtext-loading-text' => 'Cargando o texto...',
	'mwe-timedtext-textcat-cc' => 'Pés de foto',
	'mwe-timedtext-textcat-sub' => 'Subtítulos',
	'mwe-timedtext-textcat-tad' => 'Descrición do son',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Barra de información',
	'mwe-timedtext-textcat-ar' => 'Rexións activas',
	'mwe-timedtext-textcat-nb' => 'Anotación',
	'mwe-timedtext-textcat-meta' => 'Metadatos sincronizados',
	'mwe-timedtext-textcat-trx' => 'Transcrición',
	'mwe-timedtext-textcat-lrc' => 'Letra',
	'mwe-timedtext-textcat-lin' => 'Formato lingüístico',
	'mwe-timedtext-textcat-cue' => 'Puntos de sinal',
	'mwe-timedtext-language-subtitles-for-clip' => 'Subtítulos en $1 para o vídeo: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Non se atoparon os subtítulos en $1 para o vídeo: $2',
	'mwe-timedtext-request-subs' => 'Solicitar a transcrición',
	'mwe-timedtext-no-subs' => 'Non hai pistas de texto dispoñibles',
	'mwe-timedtext-request-subs-desc' => 'Engadir unha solicitude de transcrición deste ficheiro de vídeo',
	'mwe-timedtext-request-subs-done' => 'Solicitude de transcrición engadida. [$1 Ollar todas as solicitudes]',
	'mwe-timedtext-request-subs-fail' => 'Erro ao engadir a solicitude de transcrición. Accedeu ao sistema?',
	'mwe-timedtext-request-already-done' => 'Xa se solicitou a transcrición deste vídeo. [$1 Ollar todas as solicitudes]',
);

/** Swiss German (Alemannisch)
 * @author Als-Chlämens
 * @author Als-Holder
 */
$messages['gsw'] = array(
	'mwe-timedtext-editor' => 'Timed Text-Editor',
	'mwe-timedtext-stage-transcribe' => 'Abschrift mache',
	'mwe-timedtext-stage-sync' => 'Synchronisiere',
	'mwe-timedtext-stage-translate' => 'Ibersetze',
	'mwe-timedtext-stage-upload' => 'Vun ere lokale Datei uffelade',
	'mwe-timedtext-select-language' => 'Sproch wehle',
	'mwe-timedtext-file-language' => 'Sproch vu dr Untertitel',
	'mwe-timedtext-back-btn' => 'Zruck',
	'mwe-timedtext-choose-text' => 'Text uuswehle',
	'mwe-timedtext-upload-timed-text' => 'Untertitel uffelade', # Fuzzy
	'mwe-timedtext-loading-text-edit' => 'Am Lade vum Ächtzyt-Text-Editor',
	'mwe-timedtext-search' => 'Videoclip sueche',
	'mwe-timedtext-layout' => 'Uusrichtig',
	'mwe-timedtext-layout-ontop' => 'Iber em Videoclip',
	'mwe-timedtext-layout-below' => 'Unter em Videoclip',
	'mwe-timedtext-layout-off' => 'Untertitel uusblände',
	'mwe-timedtext-loading-text' => 'Am Lade vum Text ...',
	'mwe-timedtext-textcat-cc' => 'Bschryybige',
	'mwe-timedtext-textcat-sub' => 'Untertitel',
	'mwe-timedtext-textcat-tad' => 'Audio-Bschryybig',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Text-Ticker',
	'mwe-timedtext-textcat-ar' => 'Aktivi Regione',
	'mwe-timedtext-textcat-nb' => 'Aamerkig',
	'mwe-timedtext-textcat-meta' => 'Ächtzyt-Metadate',
	'mwe-timedtext-textcat-trx' => 'Abschrift',
	'mwe-timedtext-textcat-lrc' => 'Liedtext',
	'mwe-timedtext-textcat-lin' => 'Sprochwisseschaftligi Bschryybig',
	'mwe-timedtext-textcat-cue' => 'Cue-Pinkt',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 Untertitel gfunde fir dr Videoclip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Kei $1 Untertitel gfunde fir dr Videoclip: $2',
	'mwe-timedtext-request-subs' => 'Untertitel aafordre',
	'mwe-timedtext-no-subs' => 'Untertitel sin nit verfiegbar',
	'mwe-timedtext-request-subs-desc' => 'E Aafroog stelle, dass für des Video Untertitel gmacht werde',
	'mwe-timedtext-request-subs-done' => 'D Aafroog für e Untertitelig isch dezuegfiegt worde. [$1 Alli Aafrooge zur Untertitelung aaluege]',
	'mwe-timedtext-request-subs-fail' => 'Die Aafroog für e Untertitelig het nit chönne dezuegfiegt worde. Bisch aagmolde?',
	'mwe-timedtext-request-already-done' => 'Es git scho e Aafroog, dass de Video untertitelt wird. [$1 Alli Aafrooge zur Untertitelig aaluege]',
);

/** Hebrew (עברית)
 * @author Amire80
 * @author YaronSh
 */
$messages['he'] = array(
	'mwe-timedtext-editor' => 'עורך טקסט מתוזמן',
	'mwe-timedtext-stage-transcribe' => 'לתמלל',
	'mwe-timedtext-stage-sync' => 'סנכרון',
	'mwe-timedtext-stage-translate' => 'תרגום',
	'mwe-timedtext-stage-upload' => 'העלאה מקובץ מקומי',
	'mwe-timedtext-select-language' => 'בחירת שפה',
	'mwe-timedtext-file-language' => 'שפת קובץ הכתוביות',
	'mwe-timedtext-back-btn' => 'חזרה',
	'mwe-timedtext-choose-text' => 'בחירת טקסט',
	'mwe-timedtext-upload-timed-text' => 'הוספת כתוביות',
	'mwe-timedtext-loading-text-edit' => 'טעינת עורך טקסט מתוזמן',
	'mwe-timedtext-search' => 'חיפוש סרטון',
	'mwe-timedtext-layout' => 'פריסה',
	'mwe-timedtext-layout-ontop' => 'מעל הסרט',
	'mwe-timedtext-layout-below' => 'מתחת לסרט',
	'mwe-timedtext-layout-off' => 'הסתרת כתוביות',
	'mwe-timedtext-loading-text' => 'טעינת טקסט...',
	'mwe-timedtext-textcat-cc' => 'כותרות',
	'mwe-timedtext-textcat-sub' => 'כתוביות',
	'mwe-timedtext-textcat-tad' => 'תיאור השמע',
	'mwe-timedtext-textcat-ktv' => 'קראוקה',
	'mwe-timedtext-textcat-tik' => 'שפת השורה הרצה',
	'mwe-timedtext-textcat-ar' => 'אזורים פעילים',
	'mwe-timedtext-textcat-nb' => 'פרשנות',
	'mwe-timedtext-textcat-meta' => 'מטא־מתונים מתוזמנים',
	'mwe-timedtext-textcat-trx' => 'תמליל',
	'mwe-timedtext-textcat-lrc' => 'מילות השיר',
	'mwe-timedtext-textcat-lin' => 'סימון בלשני',
	'mwe-timedtext-textcat-cue' => 'נקודות סימנית',
	'mwe-timedtext-language-subtitles-for-clip' => 'כתוביות ב$1 עבור הסרטון $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'לא נמצאו כתוביות ב$1 עבור $2',
	'mwe-timedtext-request-subs' => 'לבקש תמלול',
	'mwe-timedtext-no-subs' => 'אין רצועת תמליל זמינה',
	'mwe-timedtext-request-subs-desc' => 'הוספת בקשה לתמלל את קובץ הווידאו הזה',
	'mwe-timedtext-request-subs-done' => 'נוספה בקשת תמלול. [$1 הצגת כל בקשות התמלול]',
	'mwe-timedtext-request-subs-fail' => 'הוספת בקשת התמלול נכשלה. האם נכנסתם לחשבון?',
	'mwe-timedtext-request-already-done' => 'בקשה לתמלל את הסרט הזה כבר נשלחה. [$1 הצגת כל בקשות התמלול]',
);

/** Upper Sorbian (hornjoserbsce)
 * @author Michawiki
 */
$messages['hsb'] = array(
	'mwe-timedtext-editor' => 'Editor za synchronizowany tekst',
	'mwe-timedtext-stage-transcribe' => 'Přepisać',
	'mwe-timedtext-stage-sync' => 'Synchronizować',
	'mwe-timedtext-stage-translate' => 'Přełožić',
	'mwe-timedtext-stage-upload' => 'Z lokalneje dataje nahrać',
	'mwe-timedtext-select-language' => 'Rěč wubrać',
	'mwe-timedtext-file-language' => 'Rěč dataje podtitula',
	'mwe-timedtext-back-btn' => 'Wróćo',
	'mwe-timedtext-choose-text' => 'Tekst wubrać',
	'mwe-timedtext-upload-timed-text' => 'Podtitule přidać',
	'mwe-timedtext-loading-text-edit' => 'Editor za synchronizowany tekst so startuje',
	'mwe-timedtext-search' => 'Klip pytać',
	'mwe-timedtext-layout' => 'Wusměrjenje',
	'mwe-timedtext-layout-ontop' => 'Nad widejom',
	'mwe-timedtext-layout-below' => 'Pod widejom',
	'mwe-timedtext-layout-off' => 'Podtitule schować',
	'mwe-timedtext-loading-text' => 'Tekst so začituje...',
	'mwe-timedtext-textcat-cc' => 'Nadpisma',
	'mwe-timedtext-textcat-sub' => 'Podtitule',
	'mwe-timedtext-textcat-tad' => 'Awdiowopisanje',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Tekstowy běžacy pask',
	'mwe-timedtext-textcat-ar' => 'Aktiwne regiony',
	'mwe-timedtext-textcat-nb' => 'Anotacija',
	'mwe-timedtext-textcat-meta' => 'Synchronizowane metadaty',
	'mwe-timedtext-textcat-trx' => 'Přepis',
	'mwe-timedtext-textcat-lrc' => 'Spěwowy tekst',
	'mwe-timedtext-textcat-lin' => 'Rěčespytne wopisanje',
	'mwe-timedtext-textcat-cue' => 'Zastupne dypki',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 {{PLURAL:$1|podtitul|podtitulej|podtitule|podtitulow}} za klip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Žane podtitule $1 za klip namakane: $2',
	'mwe-timedtext-request-subs' => 'Transkripciju požadać',
	'mwe-timedtext-no-subs' => 'Žane podtitule k dispoziciji',
	'mwe-timedtext-request-subs-desc' => 'Požadanje za transkripciju tuteje widejodataje přidać',
	'mwe-timedtext-request-subs-done' => 'Požadanje wo transkripciju přidate. [$1 Hlej wšě požadanja wo transkripciju]',
	'mwe-timedtext-request-subs-fail' => 'Přidawanje požadanje wo transkripciju je so njeporadźiło. Sy so přizjewił?',
	'mwe-timedtext-request-already-done' => 'Transkripcija tutoho wideja je so hižo požadała. [$1 Hlej wšě požadanja wo transkripciju]',
);

/** Hungarian (magyar)
 * @author Dani
 * @author Glanthor Reviol
 */
$messages['hu'] = array(
	'mwe-timedtext-stage-transcribe' => 'Átírás',
	'mwe-timedtext-stage-sync' => 'Szinkronizálás',
	'mwe-timedtext-stage-translate' => 'Fordítás',
	'mwe-timedtext-stage-upload' => 'Helyi fájl feltöltése',
	'mwe-timedtext-select-language' => 'Nyelv kiválasztása',
	'mwe-timedtext-file-language' => 'Feliratfájl nyelve',
	'mwe-timedtext-back-btn' => 'Vissza',
	'mwe-timedtext-choose-text' => 'Szöveg választása',
	'mwe-timedtext-upload-timed-text' => 'Felirat feltöltése', # Fuzzy
	'mwe-timedtext-loading-text-edit' => 'Időzítettszöveg-szerkesztő betöltése',
	'mwe-timedtext-search' => 'Klip keresése',
	'mwe-timedtext-layout' => 'Elrendezés',
	'mwe-timedtext-layout-ontop' => 'A videó felett',
	'mwe-timedtext-layout-below' => 'A videó alatt',
	'mwe-timedtext-layout-off' => 'Feliratok elrejtése',
	'mwe-timedtext-loading-text' => 'Szöveg betöltése…',
	'mwe-timedtext-textcat-cc' => 'Feliratok',
	'mwe-timedtext-textcat-sub' => 'Felirat',
	'mwe-timedtext-textcat-tad' => 'Hang leírása',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-ar' => 'Aktív régiók',
	'mwe-timedtext-textcat-nb' => 'Annotáció',
	'mwe-timedtext-textcat-meta' => 'Időzített metaadatok',
	'mwe-timedtext-textcat-trx' => 'Átirat',
	'mwe-timedtext-textcat-lrc' => 'Dalszöveg',
	'mwe-timedtext-textcat-lin' => 'Nyelvi jelölés',
);

/** Interlingua (interlingua)
 * @author McDutchie
 */
$messages['ia'] = array(
	'mwe-timedtext-editor' => 'Editor de subtitulos',
	'mwe-timedtext-stage-transcribe' => 'Transcriber',
	'mwe-timedtext-stage-sync' => 'Sync',
	'mwe-timedtext-stage-translate' => 'Traducer',
	'mwe-timedtext-stage-upload' => 'Incargar ex un file local',
	'mwe-timedtext-select-language' => 'Selige lingua',
	'mwe-timedtext-file-language' => 'Lingua del file de subtitulos',
	'mwe-timedtext-back-btn' => 'Retornar',
	'mwe-timedtext-choose-text' => 'Selige texto',
	'mwe-timedtext-upload-timed-text' => 'Adder subtitulos',
	'mwe-timedtext-loading-text-edit' => 'Carga le editor de subtitulos…',
	'mwe-timedtext-search' => 'Cercar clip',
	'mwe-timedtext-layout' => 'Disposition',
	'mwe-timedtext-layout-ontop' => 'Super le video',
	'mwe-timedtext-layout-below' => 'Sub le video',
	'mwe-timedtext-layout-off' => 'Celar subtitulos',
	'mwe-timedtext-loading-text' => 'Carga texto…',
	'mwe-timedtext-textcat-cc' => 'Subtitulos',
	'mwe-timedtext-textcat-sub' => 'Subtitulos',
	'mwe-timedtext-textcat-tad' => 'Description audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Barra de information',
	'mwe-timedtext-textcat-ar' => 'Regiones active',
	'mwe-timedtext-textcat-nb' => 'Annotation',
	'mwe-timedtext-textcat-meta' => 'Metadatos de synchronisation',
	'mwe-timedtext-textcat-trx' => 'Transcription',
	'mwe-timedtext-textcat-lrc' => 'Lyricos',
	'mwe-timedtext-textcat-lin' => 'Marcation lingusitic',
	'mwe-timedtext-textcat-cue' => 'Punctos de entrata',
	'mwe-timedtext-language-subtitles-for-clip' => 'Subtitulos in $1 pro le clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Nulle subtitulos in $1 ha essite trovate pro le clip: $2',
	'mwe-timedtext-request-subs' => 'Requestar transcription',
	'mwe-timedtext-no-subs' => 'Subtitulos non disponibile',
	'mwe-timedtext-request-subs-desc' => 'Adder un requesta que iste file video sia transcribite',
	'mwe-timedtext-request-subs-done' => 'Requesta de transcription addite. [$1 Vide tote le requestas de transcriber]',
	'mwe-timedtext-request-subs-fail' => 'Addition del requesta de transcription fallite. Ha tu aperite session?',
	'mwe-timedtext-request-already-done' => 'Un transcription de iste video ha jam essite requestate. [$1 Vide tote le requestas de transcriber]',
);

/** Indonesian (Bahasa Indonesia)
 * @author Farras
 * @author IvanLanin
 */
$messages['id'] = array(
	'mwe-timedtext-editor' => 'Penyunting teks berjangka waktu',
	'mwe-timedtext-stage-transcribe' => 'Transkripsikan',
	'mwe-timedtext-stage-sync' => 'Sinkronisasikan',
	'mwe-timedtext-stage-translate' => 'Terjemahkan',
	'mwe-timedtext-stage-upload' => 'Unggah dari berkas lokal',
	'mwe-timedtext-select-language' => 'Pilih bahasa',
	'mwe-timedtext-file-language' => 'Bahasa berkas subjudul',
	'mwe-timedtext-back-btn' => 'Kembali',
	'mwe-timedtext-choose-text' => 'Pilih teks',
	'mwe-timedtext-upload-timed-text' => 'Unggah teks film', # Fuzzy
	'mwe-timedtext-loading-text-edit' => 'Memuat penyunting teks berjangka waktu',
	'mwe-timedtext-search' => 'Cari klip',
	'mwe-timedtext-layout' => 'Tampilan',
	'mwe-timedtext-layout-ontop' => 'Di atas video',
	'mwe-timedtext-layout-below' => 'Di bawah video',
	'mwe-timedtext-layout-off' => 'Sembunyikan subjudul',
	'mwe-timedtext-loading-text' => 'Memuat teks ...',
	'mwe-timedtext-textcat-cc' => 'Keterangan',
	'mwe-timedtext-textcat-sub' => 'Subjudul',
	'mwe-timedtext-textcat-tad' => 'Deskripsi audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Teks tik',
	'mwe-timedtext-textcat-ar' => 'Wilayah aktif',
	'mwe-timedtext-textcat-nb' => 'Anotasi',
	'mwe-timedtext-textcat-meta' => 'Data meta berjangka waktu',
	'mwe-timedtext-textcat-trx' => 'Transkrip',
	'mwe-timedtext-textcat-lrc' => 'Lirik',
	'mwe-timedtext-textcat-lin' => 'Ubahan linguistik',
	'mwe-timedtext-textcat-cue' => 'Titik acuan',
	'mwe-timedtext-language-subtitles-for-clip' => 'Subjudul $1 untuk klip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Tidak ada subjudul $1 yang ditemukan untuk klip: $2',
	'mwe-timedtext-request-subs' => 'Minta transkripsi',
	'mwe-timedtext-no-subs' => 'Jalur teks tidak tersedia',
	'mwe-timedtext-request-subs-desc' => 'Berikan permintaan transkripsi untuk berkas video ini',
	'mwe-timedtext-request-subs-done' => 'Permintaan transkripsi ditambahkan. [$1 Lihat semua permintaan]',
	'mwe-timedtext-request-subs-fail' => 'Gagal menambah permintaan transkripsi. Apakah Anda masuk log?',
	'mwe-timedtext-request-already-done' => 'Transkripsi dari video ini telah diminta. [$1 Lihat semua permintaan]',
);

/** Italian (italiano)
 * @author Beta16
 * @author Darth Kule
 * @author F. Cosoleto
 * @author Gianfranco
 */
$messages['it'] = array(
	'mwe-timedtext-editor' => 'Editor sottotitoli',
	'mwe-timedtext-stage-transcribe' => 'Trascrivi',
	'mwe-timedtext-stage-sync' => 'Sincronizza',
	'mwe-timedtext-stage-translate' => 'Traduci',
	'mwe-timedtext-stage-upload' => 'Carica da file locale',
	'mwe-timedtext-select-language' => 'Seleziona lingua',
	'mwe-timedtext-file-language' => 'Lingua file sottotitoli',
	'mwe-timedtext-back-btn' => 'Indietro',
	'mwe-timedtext-choose-text' => 'Scegli il testo',
	'mwe-timedtext-upload-timed-text' => 'Aggiungi sottotitoli',
	'mwe-timedtext-loading-text-edit' => 'Caricamento editor sottotitoli',
	'mwe-timedtext-search' => 'Ricerca clip',
	'mwe-timedtext-layout' => 'Aspetto',
	'mwe-timedtext-layout-ontop' => 'Sopra il video',
	'mwe-timedtext-layout-below' => 'Sotto il video',
	'mwe-timedtext-layout-off' => 'Nascondi sottotitoli',
	'mwe-timedtext-loading-text' => 'Caricamento testo...',
	'mwe-timedtext-textcat-cc' => 'Didascalie',
	'mwe-timedtext-textcat-sub' => 'Sottotitoli',
	'mwe-timedtext-textcat-tad' => 'Descrizione audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-ar' => 'Regioni attive',
	'mwe-timedtext-textcat-nb' => 'Annotazione',
	'mwe-timedtext-textcat-trx' => 'Trascrizione',
	'mwe-timedtext-textcat-lrc' => 'Testi',
	'mwe-timedtext-language-subtitles-for-clip' => 'sottotitoli in $1 per il clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Sottotitoli in $1 non trovati per il clip: $2',
	'mwe-timedtext-request-subs' => 'Richiedi trascrizione',
	'mwe-timedtext-no-subs' => 'Nessuna traccia di testo disponibile',
	'mwe-timedtext-request-subs-desc' => 'Aggiungi una richiesta per la trascrizione di questo video',
	'mwe-timedtext-request-subs-done' => 'Richiesta di trascrizione aggiunta. [$1 Vedi tutte le richieste di trascrizione]',
	'mwe-timedtext-request-subs-fail' => "Impossibile aggiungere la richiesta di trascrizione. Hai effettuato l'accesso?",
	'mwe-timedtext-request-already-done' => 'Una trascrizione di questo video è già stata richiesta. [$1 Vedi tutte le richieste di trascrizione]',
);

/** Japanese (日本語)
 * @author Aotake
 * @author Hosiryuhosi
 * @author Shirayuki
 * @author Yanajin66
 * @author 青子守歌
 */
$messages['ja'] = array(
	'mwe-timedtext-editor' => '字幕エディター',
	'mwe-timedtext-stage-transcribe' => '文字起こし',
	'mwe-timedtext-stage-sync' => '同期',
	'mwe-timedtext-stage-translate' => '翻訳',
	'mwe-timedtext-stage-upload' => 'ローカルファイルからアップロード',
	'mwe-timedtext-select-language' => '言語を選択',
	'mwe-timedtext-file-language' => '字幕ファイルの言語',
	'mwe-timedtext-back-btn' => '戻る',
	'mwe-timedtext-choose-text' => 'テキストを選択',
	'mwe-timedtext-upload-timed-text' => '字幕を追加',
	'mwe-timedtext-loading-text-edit' => '字幕エディターの読み込み中',
	'mwe-timedtext-search' => 'クリップの検索',
	'mwe-timedtext-layout' => 'レイアウト',
	'mwe-timedtext-layout-ontop' => '動画の冒頭',
	'mwe-timedtext-layout-below' => '以下の動画',
	'mwe-timedtext-layout-off' => '字幕を隠す',
	'mwe-timedtext-loading-text' => 'テキストの読み込み中...',
	'mwe-timedtext-textcat-cc' => '見出し',
	'mwe-timedtext-textcat-sub' => '字幕',
	'mwe-timedtext-textcat-tad' => '音声の説明',
	'mwe-timedtext-textcat-ktv' => 'カラオケ',
	'mwe-timedtext-textcat-tik' => 'ティッカー文章',
	'mwe-timedtext-textcat-ar' => 'アクティブな領域',
	'mwe-timedtext-textcat-nb' => '注釈',
	'mwe-timedtext-textcat-meta' => '時間メタデータ',
	'mwe-timedtext-textcat-trx' => '複写',
	'mwe-timedtext-textcat-lrc' => '歌詞',
	'mwe-timedtext-textcat-lin' => '言語マーク',
	'mwe-timedtext-textcat-cue' => 'キューポイント',
	'mwe-timedtext-language-subtitles-for-clip' => 'クリップ $2 の$1字幕',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'クリップ $2 には$1字幕がありません',
);

/** Georgian (ქართული)
 * @author David1010
 */
$messages['ka'] = array(
	'mwe-timedtext-editor' => 'სინქრონიზირებული ტექსტის რედაქტირება',
	'mwe-timedtext-stage-transcribe' => 'სტენოგრამა',
	'mwe-timedtext-stage-sync' => 'სინქრონიზაცია',
	'mwe-timedtext-stage-translate' => 'თარგმნა',
	'mwe-timedtext-stage-upload' => 'ლოკალური ფაილებიდან ატვირთვა',
	'mwe-timedtext-select-language' => 'აირჩიეთ ენა',
	'mwe-timedtext-file-language' => 'სუბტიტრების ფაილის ენა',
	'mwe-timedtext-back-btn' => 'უკან',
	'mwe-timedtext-choose-text' => 'აირჩიეთ ტექსტი',
	'mwe-timedtext-upload-timed-text' => 'სუბტიტრების დამატება',
	'mwe-timedtext-loading-text-edit' => 'სინქრონიზირებული ტექსტის რედაქტორის ჩატვირთვა',
	'mwe-timedtext-search' => 'კლიპის ძიება',
	'mwe-timedtext-layout' => 'მდებარეობა',
	'mwe-timedtext-layout-ontop' => 'ვიდეოს ზევით',
	'mwe-timedtext-layout-below' => 'ვიდეოს ქვევით',
	'mwe-timedtext-layout-off' => 'სუბტიტრების დამალვა',
	'mwe-timedtext-loading-text' => 'იტვირთება ტექსტი ...',
	'mwe-timedtext-textcat-cc' => 'წარწერები',
	'mwe-timedtext-textcat-sub' => 'სუბტიტრები',
	'mwe-timedtext-textcat-tad' => 'აუდიო აღწერა',
	'mwe-timedtext-textcat-ktv' => 'კარაოკე',
	'mwe-timedtext-textcat-tik' => 'ტექსტური ბარათები',
	'mwe-timedtext-textcat-ar' => 'აქტიური რეგიონები',
	'mwe-timedtext-textcat-nb' => 'ანოტაცია',
	'mwe-timedtext-textcat-meta' => 'სინქრონიზირებული მეტამონაცემები',
	'mwe-timedtext-textcat-trx' => 'სტენოგრამა',
	'mwe-timedtext-textcat-lrc' => 'სიმღერის ტექსტები',
	'mwe-timedtext-textcat-lin' => 'ლინგვისტური დანამატი',
	'mwe-timedtext-textcat-cue' => 'ნიშნული წერტილები',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 სუბტიტრები კლიპისათვის: $2',
	'mwe-timedtext-request-subs' => 'ტრანსკრიფციის მოთხოვნა',
);

/** Korean (한국어)
 * @author 아라
 */
$messages['ko'] = array(
	'mwe-timedtext-editor' => '자막 편집기',
	'mwe-timedtext-stage-transcribe' => '복사',
	'mwe-timedtext-stage-sync' => '동기',
	'mwe-timedtext-stage-translate' => '번역',
	'mwe-timedtext-stage-upload' => '로컬 파일에서 올리기',
	'mwe-timedtext-select-language' => '언어 선택',
	'mwe-timedtext-file-language' => '자막 파일 언어',
	'mwe-timedtext-back-btn' => '뒤로',
	'mwe-timedtext-choose-text' => '텍스트 선택',
	'mwe-timedtext-upload-timed-text' => '자막 추가',
	'mwe-timedtext-loading-text-edit' => '자막 편집기 불러오는 중',
	'mwe-timedtext-search' => '클립 검색',
	'mwe-timedtext-layout' => '배치',
	'mwe-timedtext-layout-ontop' => '동영상 위',
	'mwe-timedtext-layout-below' => '동영상 아래',
	'mwe-timedtext-layout-off' => '자막 숨기기',
	'mwe-timedtext-loading-text' => '텍스트 불러오는 중 ...',
	'mwe-timedtext-textcat-cc' => '설명',
	'mwe-timedtext-textcat-sub' => '자막',
	'mwe-timedtext-textcat-tad' => '소리 설명',
	'mwe-timedtext-textcat-ktv' => '가라오케',
	'mwe-timedtext-textcat-tik' => '표시기 문자',
	'mwe-timedtext-textcat-ar' => '활성 영역',
	'mwe-timedtext-textcat-nb' => '주석',
	'mwe-timedtext-textcat-meta' => '시간 메타데이터',
	'mwe-timedtext-textcat-trx' => '복사',
	'mwe-timedtext-textcat-lrc' => '가사',
	'mwe-timedtext-textcat-lin' => '언어 마크업',
	'mwe-timedtext-textcat-cue' => '큐 포인트',
	'mwe-timedtext-language-subtitles-for-clip' => '클립에 대한 $1 자막: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => '클립에 대한 $1 자막을 찾을 수 없습니다: $2',
	'mwe-timedtext-request-subs' => '복사 요청',
	'mwe-timedtext-no-subs' => '사용할 수 있는 텍스트 트랙이 없습니다',
	'mwe-timedtext-request-subs-desc' => '복사할 이 동영상 파일에 대한 요청 추가',
	'mwe-timedtext-request-subs-done' => '복사 요청을 추가했습니다. [$1 모든 복사 요청을 봅니다]',
	'mwe-timedtext-request-subs-fail' => '복사 요청을 추가하는 데 실패했습니다. 로그인하시겠습니까?',
	'mwe-timedtext-request-already-done' => '이 동영상의 복사를 이미 요청했습니다. [$1 모든 복사 요청을 봅니다]',
);

/** Colognian (Ripoarisch)
 * @author Purodha
 */
$messages['ksh'] = array(
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Mer han kei $1 Ongertittelle jefonge för dat Shtöck: $2',
);

/** Luxembourgish (Lëtzebuergesch)
 * @author Robby
 * @author Soued031
 */
$messages['lb'] = array(
	'mwe-timedtext-stage-transcribe' => 'Ëmschreiwen',
	'mwe-timedtext-stage-sync' => 'Synchroniséieren',
	'mwe-timedtext-stage-translate' => 'Iwwersetzen',
	'mwe-timedtext-stage-upload' => 'E lokale Fichier eroplueden',
	'mwe-timedtext-select-language' => 'Sprooch eraussichen',
	'mwe-timedtext-file-language' => 'Sprooch vum Fichier mat den Ënnertitelen',
	'mwe-timedtext-back-btn' => 'Zréck',
	'mwe-timedtext-choose-text' => 'Text eraussichen',
	'mwe-timedtext-upload-timed-text' => 'Ënnertitelen derbäisetzen',
	'mwe-timedtext-search' => 'Clip sichen',
	'mwe-timedtext-layout' => 'Layout',
	'mwe-timedtext-layout-ontop' => 'Iwwer dem Video',
	'mwe-timedtext-layout-below' => 'Ënner dem Video',
	'mwe-timedtext-layout-off' => 'Ënnertitele verstoppen',
	'mwe-timedtext-loading-text' => 'Text gëtt gelueden ...',
	'mwe-timedtext-textcat-sub' => 'Ënnertitelen',
	'mwe-timedtext-textcat-tad' => 'Audio-Beschreiwung',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Text-Ticker',
	'mwe-timedtext-textcat-ar' => 'Aktiv Regiounen',
	'mwe-timedtext-textcat-nb' => 'Notiz',
	'mwe-timedtext-textcat-lrc' => 'Liddertext',
	'mwe-timedtext-textcat-lin' => 'Linguistesch Markéierung',
	'mwe-timedtext-textcat-cue' => 'Referenz-Punkten',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 Ënnertitele fir de Clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Keng $1 Ënnertitele goufe fonnt fir de Clip: $2',
);

/** Latvian (latviešu)
 * @author Papuass
 */
$messages['lv'] = array(
	'mwe-timedtext-stage-translate' => 'Tulkot',
	'mwe-timedtext-select-language' => 'Izvēlieties valodu',
	'mwe-timedtext-file-language' => 'Subtitru faila valoda',
	'mwe-timedtext-textcat-nb' => 'Anotācija',
	'mwe-timedtext-textcat-trx' => 'Transkripts',
);

/** Macedonian (македонски)
 * @author Bjankuloski06
 */
$messages['mk'] = array(
	'mwe-timedtext-editor' => 'Уредник на синхронизиран текст',
	'mwe-timedtext-stage-transcribe' => 'Направи стенограм',
	'mwe-timedtext-stage-sync' => 'Синхро',
	'mwe-timedtext-stage-translate' => 'Преведи',
	'mwe-timedtext-stage-upload' => 'Подигни од локална податотека',
	'mwe-timedtext-select-language' => 'Одберете јазик',
	'mwe-timedtext-file-language' => 'Јазик на податотеката со титл',
	'mwe-timedtext-back-btn' => 'Назад',
	'mwe-timedtext-choose-text' => 'Одберете текст',
	'mwe-timedtext-upload-timed-text' => 'Стави титлови',
	'mwe-timedtext-loading-text-edit' => 'Ги вчитувам уредникот на синхронизиран текст',
	'mwe-timedtext-search' => 'Пребарај снимка',
	'mwe-timedtext-layout' => 'Распоред',
	'mwe-timedtext-layout-ontop' => 'Над снимката',
	'mwe-timedtext-layout-below' => 'Под снимката',
	'mwe-timedtext-layout-off' => 'Скриј титлови',
	'mwe-timedtext-loading-text' => 'Го вчитувам текстот...',
	'mwe-timedtext-textcat-cc' => 'Опис',
	'mwe-timedtext-textcat-sub' => 'Титлови',
	'mwe-timedtext-textcat-tad' => 'Аудио-опис',
	'mwe-timedtext-textcat-ktv' => 'Караоке',
	'mwe-timedtext-textcat-tik' => 'Текст-картички',
	'mwe-timedtext-textcat-ar' => 'Активни региони',
	'mwe-timedtext-textcat-nb' => 'Прибелешка',
	'mwe-timedtext-textcat-meta' => 'Синхронизирани метаподатоци',
	'mwe-timedtext-textcat-trx' => 'Стенограм',
	'mwe-timedtext-textcat-lrc' => 'Текст на песната',
	'mwe-timedtext-textcat-lin' => 'Лингвистичко означување',
	'mwe-timedtext-textcat-cue' => 'Моментни точки',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 — титлови за снимката: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Нема пронајдено титлови на $1 за снимката: $2',
	'mwe-timedtext-request-subs' => 'Побарај транскрипција',
	'mwe-timedtext-no-subs' => 'Нема титлови на располагање',
	'mwe-timedtext-request-subs-desc' => 'Постави барање за транскрипција на оваа видеоснимка',
	'mwe-timedtext-request-subs-done' => 'Барањето е поставено. [$1 Сите барања]',
	'mwe-timedtext-request-subs-fail' => 'Не успеав да поставам барање за транскрипција. Дали сте најавени?',
	'mwe-timedtext-request-already-done' => 'Веќе има поставено барање за транскрипција на оваа видеоснимка. [$1 Сите барања]',
);

/** Malayalam (മലയാളം)
 * @author Praveenp
 */
$messages['ml'] = array(
	'mwe-timedtext-editor' => 'സമയമനുസരിച്ചുള്ള എഴുത്തിന്റെ തിരുത്തലുപകരണം',
	'mwe-timedtext-stage-transcribe' => 'പകർത്തിയെഴുതുക',
	'mwe-timedtext-stage-sync' => 'താദാമ്യപ്പെടുത്തുക',
	'mwe-timedtext-stage-translate' => 'പരിഭാഷപ്പെടുത്തുക',
	'mwe-timedtext-stage-upload' => 'പ്രാദേശിക പ്രമാണത്തിൽ നിന്നും അപ്‌ലോഡ് ചെയ്യുക',
	'mwe-timedtext-select-language' => 'ഭാഷ തിരഞ്ഞെടുക്കുക',
	'mwe-timedtext-file-language' => 'സംഭാഷണരേഖാ പ്രമാണത്തിന്റെ ഭാഷ',
	'mwe-timedtext-back-btn' => 'പുറകോട്ട്',
	'mwe-timedtext-choose-text' => 'എഴുത്ത് എടുക്കുക',
	'mwe-timedtext-upload-timed-text' => 'സംഭാഷണരേഖ കൂട്ടിച്ചേർക്കുക',
	'mwe-timedtext-loading-text-edit' => 'സമയാനുസൃതമായുള്ള എഴുത്ത് തിരുത്തലുപകരണം എടുക്കുന്നു',
	'mwe-timedtext-search' => 'മീഡിയശകലത്തിൽ തിരയുക',
	'mwe-timedtext-layout' => 'രൂപഘടന',
	'mwe-timedtext-layout-ontop' => 'ചലച്ചത്രത്തിനുപരി',
	'mwe-timedtext-layout-below' => 'ചലച്ചിത്രത്തിനു താഴെ',
	'mwe-timedtext-layout-off' => 'സംഭാഷണരേഖ മറയ്ക്കുക',
	'mwe-timedtext-loading-text' => 'എഴുത്ത് ശേഖരിക്കുന്നു...',
	'mwe-timedtext-textcat-cc' => 'തലവാക്യം',
	'mwe-timedtext-textcat-sub' => 'സംഭാഷണരേഖകൾ',
	'mwe-timedtext-textcat-tad' => 'ശബ്ദത്തിന്റെ വിവരണം',
	'mwe-timedtext-textcat-ktv' => 'കരോക്കേ',
	'mwe-timedtext-textcat-tik' => 'മിന്നിവരുന്ന എഴുത്ത്',
	'mwe-timedtext-textcat-ar' => 'സജീവമായ പ്രദേശങ്ങൾ',
	'mwe-timedtext-textcat-nb' => 'ടിപ്പണി',
	'mwe-timedtext-textcat-meta' => 'സമയമനുസരിച്ചുള്ള മെറ്റാഡേറ്റ',
	'mwe-timedtext-textcat-trx' => 'പകർത്തിയെഴുത്ത്',
	'mwe-timedtext-textcat-lrc' => 'വരികൾ',
	'mwe-timedtext-textcat-lin' => 'ഭാഷാസംബന്ധിയായ അടയാളഭാഷ',
	'mwe-timedtext-textcat-cue' => 'സൂചക ബിന്ദുക്കൾ',
	'mwe-timedtext-language-subtitles-for-clip' => 'ഈ മീഡിയശകലത്തിന് $1 ഭാഷയിലുള്ള സംഭാഷണരേഖ: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'ഈ മീഡിയശകലത്തിന് $1 ഭാഷയിലുള്ള സംഭാഷണരേഖയൊന്നും കണ്ടെത്താനായില്ല: $2',
	'mwe-timedtext-request-subs' => 'എഴുത്ത് ആവശ്യപ്പെടുക',
	'mwe-timedtext-no-subs' => 'എഴുത്തുകളുടെ വരി ലഭ്യമല്ല',
	'mwe-timedtext-request-subs-desc' => 'ഈ ചലച്ചിത്രപ്രമാണം എഴുതിരേഖപ്പെടുത്തുന്നതിനുള്ള അഭ്യർത്ഥന ചേർക്കുക',
	'mwe-timedtext-request-subs-done' => 'എഴുതിരേഖപ്പെടുത്തുന്നതിനുള്ള അഭ്യർത്ഥന ചേർത്തിരിക്കുന്നു.  [$1 എല്ലാ എഴുതിരേഖപ്പെടുത്തൽ അഭ്യർത്ഥനകളും കാണുക]',
	'mwe-timedtext-request-subs-fail' => 'എഴുതിരേഖപ്പെടുത്താനുള്ള അഭ്യർത്ഥന പരാജയപ്പെട്ടു. താങ്കൾ ലോഗിൻ ചെയ്തിട്ടുണ്ടോ?',
	'mwe-timedtext-request-already-done' => 'ഈ ചലച്ചിത്രം എഴുതിരേഖപ്പെടുത്താനുള്ള അഭ്യർത്ഥന മുമ്പേ ഉണ്ട്. [$1 എല്ലാ എഴുതിരേഖപ്പെടുത്തൽ അഭ്യർത്ഥനകളും കാണുക]',
);

/** Malay (Bahasa Melayu)
 * @author Anakmalaysia
 */
$messages['ms'] = array(
	'mwe-timedtext-editor' => 'Editor sari kata bermasa',
	'mwe-timedtext-stage-transcribe' => 'Transkripkan',
	'mwe-timedtext-stage-sync' => 'Segerakkan',
	'mwe-timedtext-stage-translate' => 'Terjemah',
	'mwe-timedtext-stage-upload' => 'Muat naik dari fail tempatan',
	'mwe-timedtext-select-language' => 'Pilih bahasa',
	'mwe-timedtext-file-language' => 'Bahasa fail sarikata',
	'mwe-timedtext-back-btn' => 'Kembali',
	'mwe-timedtext-choose-text' => 'Pilih teks',
	'mwe-timedtext-upload-timed-text' => 'Letak sari kata',
	'mwe-timedtext-loading-text-edit' => 'Editor sari kata sedang dimuatkan',
	'mwe-timedtext-search' => 'Cari klip',
	'mwe-timedtext-layout' => 'Susun atur',
	'mwe-timedtext-layout-ontop' => 'Di atas video',
	'mwe-timedtext-layout-below' => 'Di bawah video',
	'mwe-timedtext-layout-off' => 'Sorokkan sari kata',
	'mwe-timedtext-loading-text' => 'Teks sedang dimuatkan...',
	'mwe-timedtext-textcat-cc' => 'Kapsyen',
	'mwe-timedtext-textcat-sub' => 'Sari kata',
	'mwe-timedtext-textcat-tad' => 'Keterangan audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Teks ticker',
	'mwe-timedtext-textcat-ar' => 'Kawasan aktif',
	'mwe-timedtext-textcat-nb' => 'Anotasi',
	'mwe-timedtext-textcat-meta' => 'Metadata bermasa',
	'mwe-timedtext-textcat-trx' => 'Transkrip',
	'mwe-timedtext-textcat-lrc' => 'Lirik',
	'mwe-timedtext-textcat-lin' => 'Penanda linguistik',
	'mwe-timedtext-textcat-cue' => 'Titik kiu',
	'mwe-timedtext-language-subtitles-for-clip' => 'Sari kata $1 untuk klip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Tidak terdapat sari kata $1 untuk klip: $2',
	'mwe-timedtext-request-subs' => 'Mohon transkripsi',
	'mwe-timedtext-no-subs' => 'Tidak terdapat runut teks',
	'mwe-timedtext-request-subs-desc' => 'Mohon transkripsi untuk fail video ini',
	'mwe-timedtext-request-subs-done' => 'Permohonan transkripsi ditambah. [$1 Lihat semua permohonan transkripsi]',
	'mwe-timedtext-request-subs-fail' => 'Permohonan transkripsi gagal ditambah. Sudahkah anda log masuk?',
	'mwe-timedtext-request-already-done' => 'Sudah dimohon transkripsi untuk video ini. [$1 Lihat semua permohonan transkripsi]',
);

/** Norwegian Bokmål (norsk bokmål)
 * @author Danmichaelo
 * @author Nghtwlkr
 */
$messages['nb'] = array(
	'mwe-timedtext-editor' => 'Editor for tidsbestemt tekst',
	'mwe-timedtext-stage-transcribe' => 'Transkriber',
	'mwe-timedtext-stage-sync' => 'Synkroniser',
	'mwe-timedtext-stage-translate' => 'Oversett',
	'mwe-timedtext-stage-upload' => 'Last opp fra lokal fil',
	'mwe-timedtext-select-language' => 'Velg språk',
	'mwe-timedtext-file-language' => 'Undertekstfilspråk',
	'mwe-timedtext-back-btn' => 'Tilbake',
	'mwe-timedtext-choose-text' => 'Velg tekst',
	'mwe-timedtext-upload-timed-text' => 'Legg til undertekster',
	'mwe-timedtext-loading-text-edit' => 'Laster editor for tidsbestemt tekst',
	'mwe-timedtext-search' => 'Søk klipp',
	'mwe-timedtext-layout' => 'Oppsett',
	'mwe-timedtext-layout-ontop' => 'Over video',
	'mwe-timedtext-layout-below' => 'Under video',
	'mwe-timedtext-layout-off' => 'Gjem undertekster',
	'mwe-timedtext-loading-text' => 'Laster tekst ...',
	'mwe-timedtext-textcat-cc' => 'Undertektster',
	'mwe-timedtext-textcat-sub' => 'Undertekster',
	'mwe-timedtext-textcat-tad' => 'Lydbeskrivelse',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Tekst-ticker',
	'mwe-timedtext-textcat-ar' => 'Aktive regioner',
	'mwe-timedtext-textcat-nb' => 'Merknad',
	'mwe-timedtext-textcat-meta' => 'Tidsbestemt metadata',
	'mwe-timedtext-textcat-trx' => 'Transkripsjon',
	'mwe-timedtext-textcat-lrc' => 'Tekster',
	'mwe-timedtext-language-subtitles-for-clip' => 'Undertekster på $1 for klippet: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Ingen undertekster på $1 ble funnet for klippet: $2',
	'mwe-timedtext-request-subs' => 'Etterspør transkripsjon',
	'mwe-timedtext-no-subs' => 'Ingen tekstspor finnes',
	'mwe-timedtext-request-subs-desc' => 'Legg inn forespørsel om at denne videofilen blir transkribert',
	'mwe-timedtext-request-subs-done' => 'Transkripsjonsforespørsel lagt til. [$1 Vis alle transkripsjonsforespørsler]',
	'mwe-timedtext-request-subs-fail' => 'Transkripsjonsforespørselen kunne ikke lagres. Er du logget inn?',
	'mwe-timedtext-request-already-done' => 'Transkripsjon av denne videoen har allerede blitt forespurt. [$1 Vis alle transkripsjonsforespørsler]',
);

/** Dutch (Nederlands)
 * @author Siebrand
 */
$messages['nl'] = array(
	'mwe-timedtext-editor' => 'Tekstverwerker voor ondertitels',
	'mwe-timedtext-stage-transcribe' => 'Transcriptie',
	'mwe-timedtext-stage-sync' => 'Synchroniseren',
	'mwe-timedtext-stage-translate' => 'Vertalen',
	'mwe-timedtext-stage-upload' => 'Uploaden van lokaal bestand',
	'mwe-timedtext-select-language' => 'Taal selecteren',
	'mwe-timedtext-file-language' => 'Taal ondertitelbestand',
	'mwe-timedtext-back-btn' => 'Terug',
	'mwe-timedtext-choose-text' => 'Tekst kiezen',
	'mwe-timedtext-upload-timed-text' => 'Ondertitels toevoegen',
	'mwe-timedtext-loading-text-edit' => 'Bezig met het laden van de tekstverwerker voor ondertitels',
	'mwe-timedtext-search' => 'Clip zoeken',
	'mwe-timedtext-layout' => 'Vormgeving',
	'mwe-timedtext-layout-ontop' => 'Boven de video',
	'mwe-timedtext-layout-below' => 'Onder de video',
	'mwe-timedtext-layout-off' => 'Ondertitels verbergen',
	'mwe-timedtext-loading-text' => 'Bezig met het laden van de tekst...',
	'mwe-timedtext-textcat-cc' => 'Ondertitels',
	'mwe-timedtext-textcat-sub' => 'Ondertitels',
	'mwe-timedtext-textcat-tad' => 'Audiobeschrijving',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Informatiebalk',
	'mwe-timedtext-textcat-ar' => 'Actieve gebieden',
	'mwe-timedtext-textcat-nb' => 'Annotatie',
	'mwe-timedtext-textcat-meta' => 'Tijdgebaseerde metadata',
	'mwe-timedtext-textcat-trx' => 'Transcriptie',
	'mwe-timedtext-textcat-lrc' => 'Songteksten',
	'mwe-timedtext-textcat-lin' => 'Taalkundige markup',
	'mwe-timedtext-textcat-cue' => 'Richtpunten',
	'mwe-timedtext-language-subtitles-for-clip' => 'Ondertitels in het $1 voor clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Er zijn geen ondertitels in de taal $1 gevonden voor clip: $2',
	'mwe-timedtext-request-subs' => 'Transscriptieverzoek doen',
	'mwe-timedtext-no-subs' => 'Er zijn geen teksttracks beschikbaar',
	'mwe-timedtext-request-subs-desc' => 'Voerzoek toevoegen voor transscriptie van dit videobestand',
	'mwe-timedtext-request-subs-done' => 'Het transscriptieverzoek is toegevoegd. U kunt [$1 alle transscriptieverzoeken bekijken].',
	'mwe-timedtext-request-subs-fail' => 'Het toevoegen van het transscriptieverzoek is mislukt. Bent u wel aangemeld?',
	'mwe-timedtext-request-already-done' => 'Er bestaat al een transscriptieverzoek voor dit videobestand. U kunt [$1 alle transscriptieverzoeken bekijken].',
);

/** Norwegian Nynorsk (norsk nynorsk)
 * @author Njardarlogar
 */
$messages['nn'] = array(
	'mwe-timedtext-select-language' => 'Vel språk',
	'mwe-timedtext-upload-timed-text' => 'Legg til undertekstar',
	'mwe-timedtext-layout-off' => 'Gøym undertekstar',
	'mwe-timedtext-textcat-sub' => 'Undertekstar',
	'mwe-timedtext-textcat-lrc' => 'Tekstar',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 undertekstar for klippet: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Ingen undertekster på $1 vart funne for klippet: $2',
	'mwe-timedtext-no-subs' => 'Ingen tekstspor er tilgjengelege',
);

/** Deitsch (Deitsch)
 * @author Xqt
 */
$messages['pdc'] = array(
	'mwe-timedtext-stage-translate' => 'Iwwersetze',
	'mwe-timedtext-back-btn' => 'Zerrick',
);

/** Pälzisch (Pälzisch)
 * @author Manuae
 */
$messages['pfl'] = array(
	'mwe-timedtext-stage-translate' => 'Iwasedze',
);

/** Polish (polski)
 * @author BeginaFelicysym
 * @author Leinad
 * @author Shadown
 * @author Sp5uhe
 */
$messages['pl'] = array(
	'mwe-timedtext-editor' => 'Edytor napisów do filmu',
	'mwe-timedtext-stage-transcribe' => 'Rozpisz',
	'mwe-timedtext-stage-sync' => 'Synchronizacja',
	'mwe-timedtext-stage-translate' => 'Przetłumacz',
	'mwe-timedtext-stage-upload' => 'Prześlij z lokalnego pliku',
	'mwe-timedtext-select-language' => 'Wybierz język',
	'mwe-timedtext-file-language' => 'Język pliku z napisami do filmu',
	'mwe-timedtext-back-btn' => 'Wstecz',
	'mwe-timedtext-choose-text' => 'Wybierz tekst',
	'mwe-timedtext-upload-timed-text' => 'Dodaj napisy',
	'mwe-timedtext-loading-text-edit' => 'Ładowanie edytora tekstu ze znacznikami czasu',
	'mwe-timedtext-search' => 'Szukaj klipu',
	'mwe-timedtext-layout' => 'Układ',
	'mwe-timedtext-layout-ontop' => 'Na górze filmu',
	'mwe-timedtext-layout-below' => 'Poniżej obrazu',
	'mwe-timedtext-layout-off' => 'Ukryj napisy',
	'mwe-timedtext-loading-text' => 'Ładowanie tekstu...',
	'mwe-timedtext-textcat-cc' => 'Podpisy',
	'mwe-timedtext-textcat-sub' => 'Napisy do filmu',
	'mwe-timedtext-textcat-tad' => 'Opis ścieżki dźwiękowej',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Notatka',
	'mwe-timedtext-textcat-ar' => 'Aktywne regiony',
	'mwe-timedtext-textcat-nb' => 'Adnotacja',
	'mwe-timedtext-textcat-meta' => 'Metadane ze znacznikami czasu',
	'mwe-timedtext-textcat-trx' => 'Rozpisz',
	'mwe-timedtext-textcat-lrc' => 'Teksty piosenek',
	'mwe-timedtext-textcat-lin' => 'Znaczniki językowe',
	'mwe-timedtext-textcat-cue' => 'Punkty kontrolne',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 napisy do filmu: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Nie odnaleziono $1 napisów do filmu: $2',
	'mwe-timedtext-request-subs' => 'Poproś o transkrypcję',
	'mwe-timedtext-no-subs' => 'Nie ma dostępnych ścieżek tekstowych',
	'mwe-timedtext-request-subs-desc' => 'Dodaj prośbę transkrypcji dla tego pliku wideo',
	'mwe-timedtext-request-subs-done' => 'Dodano prośbę transkrypcji. [ $1  Zobacz wszystkie prośby transkrypcji]',
	'mwe-timedtext-request-subs-fail' => 'Nie udało się doanie prośby transkrypcji. Czy jesteś zalogowany?',
	'mwe-timedtext-request-already-done' => 'Już złożono prośbę o transkrypcję tego wideo. [ $1  Zobacz wszystkie prośby transkrypcji]',
);

/** Piedmontese (Piemontèis)
 * @author Borichèt
 * @author Dragonòt
 */
$messages['pms'] = array(
	'mwe-timedtext-editor' => 'Editor ëd test temporisà',
	'mwe-timedtext-stage-transcribe' => 'Trascriv',
	'mwe-timedtext-stage-sync' => 'Sincronisa',
	'mwe-timedtext-stage-translate' => 'Volté',
	'mwe-timedtext-stage-upload' => "Carié da n'archivi local",
	'mwe-timedtext-select-language' => 'Serne la lenga',
	'mwe-timedtext-file-language' => "Lenga dl'archivi ëd sot-tìtoj",
	'mwe-timedtext-back-btn' => 'André',
	'mwe-timedtext-choose-text' => 'Serne ël test',
	'mwe-timedtext-upload-timed-text' => 'Gionté dij sot-tìtoj',
	'mwe-timedtext-loading-text-edit' => "Cariament ëd l'editor ëd test sincronisà",
	'mwe-timedtext-search' => 'Sërché un tòch filmà',
	'mwe-timedtext-layout' => 'Presentassion',
	'mwe-timedtext-layout-ontop' => 'An cò dël filmà',
	'mwe-timedtext-layout-below' => 'Sota ël filmà',
	'mwe-timedtext-layout-off' => 'Stërmé ij sot-tìtoj',
	'mwe-timedtext-loading-text' => 'Cariament dël test...',
	'mwe-timedtext-textcat-cc' => 'Descrission',
	'mwe-timedtext-textcat-sub' => 'Sot-tìtoj',
	'mwe-timedtext-textcat-tad' => 'Descrission àudio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Test ëd la telescrivent',
	'mwe-timedtext-textcat-ar' => 'Region ative',
	'mwe-timedtext-textcat-nb' => 'Nòta',
	'mwe-timedtext-textcat-meta' => 'Metadat sincronisà',
	'mwe-timedtext-textcat-trx' => 'Trascrission',
	'mwe-timedtext-textcat-lrc' => 'Lìriche',
	'mwe-timedtext-textcat-lin' => 'Marcador lenghìstich',
	'mwe-timedtext-textcat-cue' => "Pont d'arferiment",
	'mwe-timedtext-language-subtitles-for-clip' => '$1 sot-tìtoj për ël tòch: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => "A l'é trovasse gnun sot-tìtoj $1 per ël tòch: $2",
	'mwe-timedtext-request-subs' => 'Arcesta ëd trascrission',
	'mwe-timedtext-no-subs' => 'Gnun-e marche ëd test disponìbij',
	'mwe-timedtext-request-subs-desc' => "Gionté n'arcesta përchè cost archivi filmà a sia trascrivù",
	'mwe-timedtext-request-subs-done' => "Arcesta ëd trascrission giontà. [$1 Vardé tute j'arceste ëd trascrission]",
	'mwe-timedtext-request-subs-fail' => "Falì a gionté l'arcesta ëd trascrission. É-lo intrà ant ël sistema?",
	'mwe-timedtext-request-already-done' => "Na trascrission d'ës filmà a l'é già stàita ciamà. [$1 Vardé tute j'arceste ëd trascrission]",
);

/** Pashto (پښتو)
 * @author Ahmed-Najib-Biabani-Ibrahimkhel
 */
$messages['ps'] = array(
	'mwe-timedtext-stage-translate' => 'ژباړل',
	'mwe-timedtext-select-language' => 'ژبه ټاکل',
	'mwe-timedtext-choose-text' => 'متن ټاکل',
	'mwe-timedtext-textcat-ktv' => 'کارااوکه',
);

/** Portuguese (português)
 * @author Giro720
 * @author Hamilton Abreu
 * @author Luckas
 * @author SandroHc
 */
$messages['pt'] = array(
	'mwe-timedtext-editor' => 'Editor de legendas',
	'mwe-timedtext-stage-transcribe' => 'Transcrever',
	'mwe-timedtext-stage-sync' => 'Sincronizar',
	'mwe-timedtext-stage-translate' => 'Traduzir',
	'mwe-timedtext-stage-upload' => 'Carregar a partir de ficheiro local',
	'mwe-timedtext-select-language' => 'Escolher a língua',
	'mwe-timedtext-file-language' => 'Língua do ficheiro de legendas',
	'mwe-timedtext-back-btn' => 'Voltar',
	'mwe-timedtext-choose-text' => 'Escolher texto',
	'mwe-timedtext-upload-timed-text' => 'Adicionar legendas',
	'mwe-timedtext-loading-text-edit' => 'A carregar o editor de legendas',
	'mwe-timedtext-search' => 'Procurar clipe',
	'mwe-timedtext-layout' => 'Posição',
	'mwe-timedtext-layout-ontop' => 'Sobre o vídeo',
	'mwe-timedtext-layout-below' => 'Abaixo do vídeo',
	'mwe-timedtext-layout-off' => 'Esconder legendas',
	'mwe-timedtext-loading-text' => 'A carregar o texto ...',
	'mwe-timedtext-textcat-cc' => 'Títulos',
	'mwe-timedtext-textcat-sub' => 'Legendas',
	'mwe-timedtext-textcat-tad' => 'Descrição áudio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Cotações',
	'mwe-timedtext-textcat-ar' => 'Regiões ativas',
	'mwe-timedtext-textcat-nb' => 'Anotação',
	'mwe-timedtext-textcat-meta' => 'Metadados de sincronização',
	'mwe-timedtext-textcat-trx' => 'Transcrição',
	'mwe-timedtext-textcat-lrc' => 'Letra',
	'mwe-timedtext-textcat-lin' => 'Marcação linguística',
	'mwe-timedtext-textcat-cue' => 'Pontos de entrada',
	'mwe-timedtext-language-subtitles-for-clip' => 'Legendas em $1 para o clipe: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Não foram encontradas legendas em $1 para o clipe: $2',
	'mwe-timedtext-request-subs' => 'Pedir transcrição',
	'mwe-timedtext-no-subs' => 'Não há nenhuma faixa de texto disponível',
	'mwe-timedtext-request-subs-desc' => 'Adicionar um pedido para este ficheiro de vídeo ser transcrito',
	'mwe-timedtext-request-subs-done' => 'O pedido de transcrição foi adicionado. [$1 Ver todos os pedidos de transcrição]',
	'mwe-timedtext-request-subs-fail' => 'Não foi possível adicionar o pedido de transcrição. Está autenticado?',
	'mwe-timedtext-request-already-done' => 'Já foi pedida anteriormente uma transcrição deste vídeo. [$1 Ver todos os pedidos de transcrição]',
);

/** Brazilian Portuguese (português do Brasil)
 * @author Dianakc
 * @author Giro720
 * @author Luckas
 * @author Luckas Blade
 * @author 555
 */
$messages['pt-br'] = array(
	'mwe-timedtext-editor' => 'Editor de legendas',
	'mwe-timedtext-stage-transcribe' => 'Transcrever',
	'mwe-timedtext-stage-sync' => 'Sincronizar',
	'mwe-timedtext-stage-translate' => 'Traduzir',
	'mwe-timedtext-stage-upload' => 'Enviar arquivo local',
	'mwe-timedtext-select-language' => 'Selecionar idioma',
	'mwe-timedtext-file-language' => 'Idioma do arquivo de legendas',
	'mwe-timedtext-back-btn' => 'Voltar',
	'mwe-timedtext-choose-text' => 'Escolher texto',
	'mwe-timedtext-upload-timed-text' => 'Adicionar legendas',
	'mwe-timedtext-loading-text-edit' => 'Carregando editor de legendas',
	'mwe-timedtext-search' => 'Procurar clipe',
	'mwe-timedtext-layout' => 'Posição',
	'mwe-timedtext-layout-ontop' => 'Sobre o vídeo',
	'mwe-timedtext-layout-below' => 'Abaixo do vídeo',
	'mwe-timedtext-layout-off' => 'Ocultar legendas',
	'mwe-timedtext-loading-text' => 'Carregando o texto ...',
	'mwe-timedtext-textcat-cc' => 'Títulos',
	'mwe-timedtext-textcat-sub' => 'Legendas',
	'mwe-timedtext-textcat-tad' => 'Descrição do áudio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Texto deslizante',
	'mwe-timedtext-textcat-ar' => 'Regiões ativas',
	'mwe-timedtext-textcat-nb' => 'Anotação',
	'mwe-timedtext-textcat-meta' => 'Metadados sincronizados',
	'mwe-timedtext-textcat-trx' => 'Transcrição',
	'mwe-timedtext-textcat-lrc' => 'Letra',
	'mwe-timedtext-textcat-lin' => 'Marcação linguística',
	'mwe-timedtext-textcat-cue' => 'Pontos de entrada',
	'mwe-timedtext-language-subtitles-for-clip' => 'Legendas em $1 para o clipe: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Não foram encontradas legendas em $1 para o clipe: $2',
	'mwe-timedtext-request-subs' => 'Solicitar transcrição',
	'mwe-timedtext-no-subs' => 'Não há nenhum texto disponível',
	'mwe-timedtext-request-subs-desc' => 'Adicionar um pedido para que este arquivo de vídeo seja transcrito',
	'mwe-timedtext-request-subs-done' => 'O pedido de transcrição foi adicionado. [$1 Veja todos os pedidos de transcrição]',
	'mwe-timedtext-request-subs-fail' => 'Falha ao adicionar um pedido de transcrição. Você está autenticado?',
	'mwe-timedtext-request-already-done' => 'Já foi feito um pedido de transcrição para este vídeo. [$1 Veja todos os pedidos de transcrição]',
);

/** Romanian (română)
 * @author Minisarm
 * @author Stelistcristi
 */
$messages['ro'] = array(
	'mwe-timedtext-editor' => 'Editor de subtitrare sincronizată',
	'mwe-timedtext-stage-transcribe' => 'Transcriere',
	'mwe-timedtext-stage-sync' => 'Sincronizare',
	'mwe-timedtext-stage-translate' => 'Traducere',
	'mwe-timedtext-stage-upload' => 'Încărcare dintr-un fișier local',
	'mwe-timedtext-select-language' => 'Selectare limbă',
	'mwe-timedtext-file-language' => 'Limba fișierului de subtitrare',
	'mwe-timedtext-back-btn' => 'Înapoi',
	'mwe-timedtext-choose-text' => 'Alege textul',
	'mwe-timedtext-upload-timed-text' => 'Adaugă subtitrări',
	'mwe-timedtext-loading-text-edit' => 'Se încarcă editorul de subtitrare sincronizată',
	'mwe-timedtext-search' => 'Caută un clip',
	'mwe-timedtext-layout' => 'Aspect',
	'mwe-timedtext-layout-ontop' => 'În partea de sus a videoclipului',
	'mwe-timedtext-layout-below' => 'În partea de jos a videoclipului',
	'mwe-timedtext-layout-off' => 'Ascunde subtitrările',
	'mwe-timedtext-loading-text' => 'Se încarcă textul...',
	'mwe-timedtext-textcat-cc' => 'Legende',
	'mwe-timedtext-textcat-sub' => 'Subtitrări',
	'mwe-timedtext-textcat-tad' => 'Descriere audio',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Text mai gros',
	'mwe-timedtext-textcat-ar' => 'Regiuni active',
	'mwe-timedtext-textcat-nb' => 'Adnotare',
	'mwe-timedtext-textcat-meta' => 'Metadate sincronizate',
	'mwe-timedtext-textcat-trx' => 'Transcripție',
	'mwe-timedtext-textcat-lrc' => 'Versuri',
	'mwe-timedtext-textcat-lin' => 'Etichete lingvistice',
	'mwe-timedtext-textcat-cue' => 'Puncte de tac',
	'mwe-timedtext-language-subtitles-for-clip' => 'Subtitrare în limba $1 pentru clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Nu s-a găsit nicio subtitrare în limba $1 pentru clip: $2',
	'mwe-timedtext-request-subs' => 'Cere o transcripție',
	'mwe-timedtext-no-subs' => 'Niciun text de piesă disponibil',
	'mwe-timedtext-request-subs-desc' => 'Adăugați o cerere de transcripție pentru acest fișier video',
	'mwe-timedtext-request-subs-done' => 'Cerere de transcripție adăugată. [$1 Vezi toate cererile de transcripție]',
	'mwe-timedtext-request-subs-fail' => 'Nu s-a putut adăuga cererea de transcripție. Sunteți autentificat?',
	'mwe-timedtext-request-already-done' => 'O transcripție pentru acest videoclip a fost deja solicitată. [$1 Vezi toate cererile de transcripție]',
);

/** tarandíne (tarandíne)
 * @author Joetaras
 */
$messages['roa-tara'] = array(
	'mwe-timedtext-stage-transcribe' => 'Trascrive',
	'mwe-timedtext-stage-sync' => 'Sinc',
	'mwe-timedtext-stage-translate' => 'Traduce',
	'mwe-timedtext-stage-upload' => "Careche da 'u file locale",
	'mwe-timedtext-select-language' => "Scacchie 'a lènghe",
	'mwe-timedtext-file-language' => "Sottotitole d'u file d'a lènghe",
	'mwe-timedtext-back-btn' => 'Rrete',
	'mwe-timedtext-choose-text' => "Scacchie 'u teste",
	'mwe-timedtext-upload-timed-text' => 'Aggiunge le sottotitole',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-nb' => 'Annotazione',
	'mwe-timedtext-textcat-meta' => 'Metadate temborizzate',
	'mwe-timedtext-textcat-trx' => 'Trascrive',
	'mwe-timedtext-textcat-lrc' => 'Teste',
);

/** Russian (русский)
 * @author MaxSem
 * @author Okras
 * @author Александр Сигачёв
 */
$messages['ru'] = array(
	'mwe-timedtext-editor' => 'Редактор синхронизированного текста',
	'mwe-timedtext-stage-transcribe' => 'Стенограмма',
	'mwe-timedtext-stage-sync' => 'Синхро',
	'mwe-timedtext-stage-translate' => 'Перевод',
	'mwe-timedtext-stage-upload' => 'Загрузить из локального файла',
	'mwe-timedtext-select-language' => 'Выберите язык',
	'mwe-timedtext-file-language' => 'Язык файла субтитров',
	'mwe-timedtext-back-btn' => 'Назад',
	'mwe-timedtext-choose-text' => 'Выберите текст',
	'mwe-timedtext-upload-timed-text' => 'Добавить субтитры',
	'mwe-timedtext-loading-text-edit' => 'Загрузка редактора синхронизированного текста',
	'mwe-timedtext-search' => 'Поиск клипа',
	'mwe-timedtext-layout' => 'Положение',
	'mwe-timedtext-layout-ontop' => 'В верху видео',
	'mwe-timedtext-layout-below' => 'Внизу видео',
	'mwe-timedtext-layout-off' => 'Скрыть субтитры',
	'mwe-timedtext-loading-text' => 'Загрузка текста…',
	'mwe-timedtext-textcat-cc' => 'Субтитры-описания',
	'mwe-timedtext-textcat-sub' => 'Субтитры',
	'mwe-timedtext-textcat-tad' => 'Аудио-описание',
	'mwe-timedtext-textcat-ktv' => 'Караоке',
	'mwe-timedtext-textcat-tik' => 'Текстовые карточки',
	'mwe-timedtext-textcat-ar' => 'Активные области',
	'mwe-timedtext-textcat-nb' => 'Аннотация',
	'mwe-timedtext-textcat-meta' => 'Синхронизированные метаданные',
	'mwe-timedtext-textcat-trx' => 'Стенограмма',
	'mwe-timedtext-textcat-lrc' => 'Слова песни',
	'mwe-timedtext-textcat-lin' => 'Лингвистическая разметка',
	'mwe-timedtext-textcat-cue' => 'Знаковые точки',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 — субтитры для клипа: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Не найдено субтитров на $1 для клипа: $2',
	'mwe-timedtext-request-subs' => 'Запрос транскрипции',
	'mwe-timedtext-no-subs' => 'Нет текстовых дорожек',
	'mwe-timedtext-request-subs-desc' => 'Добавить запрос на транскрипцию этого видео',
	'mwe-timedtext-request-subs-done' => 'Добавлен запрос на транскрипцию. [$1 Просмотреть все запросы]',
	'mwe-timedtext-request-subs-fail' => 'Не удалось добавить запрос на транскрипцию. Вы представились системе?',
	'mwe-timedtext-request-already-done' => 'Транскрипция этого видео уже была запрошена. [$1 Просмотреть все запросы]',
);

/** Rusyn (русиньскый)
 * @author Gazeb
 */
$messages['rue'] = array(
	'mwe-timedtext-back-btn' => 'Назад',
);

/** Sinhala (සිංහල)
 * @author පසිඳු කාවින්ද
 */
$messages['si'] = array(
	'mwe-timedtext-editor' => 'කාලිත වදන් සකසුව',
	'mwe-timedtext-stage-transcribe' => 'අනු ලැකීම',
	'mwe-timedtext-stage-sync' => 'සමමුහුර්තකරණය',
	'mwe-timedtext-stage-translate' => 'පරිවර්තනය කරන්න',
	'mwe-timedtext-stage-upload' => 'ස්ථානික ගොනුවකින් උඩුගත කරන්න',
	'mwe-timedtext-select-language' => 'භාෂාව තෝරන්න',
	'mwe-timedtext-file-language' => 'උපසිරුස ගොනු භාෂාව',
	'mwe-timedtext-back-btn' => 'ආපසු',
	'mwe-timedtext-choose-text' => 'පාඨය තෝරන්න',
	'mwe-timedtext-upload-timed-text' => 'උපශීර්ෂ එක් කරන්න',
	'mwe-timedtext-loading-text-edit' => 'කාලිත පෙළ සකසනය පූරණය කරමින්',
	'mwe-timedtext-search' => 'ක්ලිපය සොයන්න',
	'mwe-timedtext-layout' => 'සැලැස්ම',
	'mwe-timedtext-layout-ontop' => 'වීඩියෝවේ ඉහලම',
	'mwe-timedtext-layout-below' => 'පහත වීඩියෝව',
	'mwe-timedtext-layout-off' => 'උපශීර්ෂ සඟවන්න',
	'mwe-timedtext-loading-text' => 'පෙළ පූරණය වෙමින් ...',
	'mwe-timedtext-textcat-cc' => 'උපන්‍යාස',
	'mwe-timedtext-textcat-sub' => 'උපශීර්ෂ',
	'mwe-timedtext-textcat-tad' => 'ශ්‍රව්‍ය විස්තරය',
	'mwe-timedtext-textcat-ktv' => 'කැරෝකේ',
	'mwe-timedtext-textcat-tik' => 'ඔරලෝසු පෙළ',
	'mwe-timedtext-textcat-ar' => 'සක්‍රිය ප්‍රදේශ',
	'mwe-timedtext-textcat-nb' => 'ටීකාව',
	'mwe-timedtext-textcat-meta' => 'කාලිත පාරදත්ත',
	'mwe-timedtext-textcat-trx' => 'ප්‍රතිලේඛනය',
	'mwe-timedtext-textcat-lrc' => 'ගීපදවැල්',
	'mwe-timedtext-textcat-lin' => 'භාෂාමය අධිකය',
	'mwe-timedtext-textcat-cue' => 'ඉංගිත ගතිගුණ',
	'mwe-timedtext-language-subtitles-for-clip' => 'ක්ලිපය සඳහා $1 උපසිරුස: $2',
	'mwe-timedtext-request-subs' => 'පිටපත් කිරීම අයදින්න',
	'mwe-timedtext-no-subs' => 'මීළඟ පථ ලබාගත නොහැක',
);

/** Slovenian (slovenščina)
 * @author Dbc334
 */
$messages['sl'] = array(
	'mwe-timedtext-stage-translate' => 'Prevedi',
	'mwe-timedtext-back-btn' => 'Nazaj',
);

/** Somali (Soomaaliga)
 * @author Abshirdheere
 */
$messages['so'] = array(
	'mwe-timedtext-select-language' => 'Dooro luqad',
);

/** Serbian (Cyrillic script) (српски (ћирилица)‎)
 * @author Rancher
 * @author Михајло Анђелковић
 */
$messages['sr-ec'] = array(
	'mwe-timedtext-editor' => 'Уредник усклађеног текста',
	'mwe-timedtext-stage-transcribe' => 'Направи транскрипт',
	'mwe-timedtext-stage-sync' => 'Усклади',
	'mwe-timedtext-stage-translate' => 'Преведи',
	'mwe-timedtext-stage-upload' => 'Пошаљи датотеку са рачунара',
	'mwe-timedtext-select-language' => 'Изабери језик',
	'mwe-timedtext-file-language' => 'Језик титла',
	'mwe-timedtext-back-btn' => 'Назад',
	'mwe-timedtext-layout-off' => 'Сакриј сабтајтлове',
	'mwe-timedtext-loading-text' => 'Учитава се текст ...',
	'mwe-timedtext-key-language' => '$1, $2',
	'mwe-timedtext-textcat-cc' => 'Ознаке',
	'mwe-timedtext-textcat-sub' => 'Поднаслови',
	'mwe-timedtext-textcat-trx' => 'Транскрипт',
);

/** Serbian (Latin script) (srpski (latinica)‎)
 * @author Rancher
 */
$messages['sr-el'] = array(
	'mwe-timedtext-editor' => 'Urednik usklađenog teksta',
	'mwe-timedtext-stage-transcribe' => 'Napravi transkript',
	'mwe-timedtext-stage-sync' => 'Uskladi',
	'mwe-timedtext-stage-translate' => 'Prevedi',
	'mwe-timedtext-stage-upload' => 'Pošalji datoteku sa računara',
	'mwe-timedtext-select-language' => 'Izaberi jezik',
	'mwe-timedtext-file-language' => 'Jezik titla',
	'mwe-timedtext-back-btn' => 'Nazad',
	'mwe-timedtext-layout-off' => 'Sakrij sabtajtlove',
	'mwe-timedtext-loading-text' => 'Učitava se tekst ...',
	'mwe-timedtext-key-language' => '$1, $2',
	'mwe-timedtext-textcat-cc' => 'Oznake',
	'mwe-timedtext-textcat-sub' => 'Podnaslovi',
	'mwe-timedtext-textcat-trx' => 'Transkript',
);

/** Swedish (svenska)
 * @author Ainali
 * @author Dafer45
 */
$messages['sv'] = array(
	'mwe-timedtext-editor' => 'Tidsbestämd textredigerare',
	'mwe-timedtext-stage-transcribe' => 'Transkribera',
	'mwe-timedtext-stage-sync' => 'Sync',
	'mwe-timedtext-stage-translate' => 'Översätt',
	'mwe-timedtext-stage-upload' => 'Ladda upp från lokal fil',
	'mwe-timedtext-select-language' => 'Välj språk',
	'mwe-timedtext-file-language' => 'Undertextfilspråk',
	'mwe-timedtext-back-btn' => 'Tillbaka',
	'mwe-timedtext-choose-text' => 'Välj text',
	'mwe-timedtext-upload-timed-text' => 'Lägga till undertexter',
	'mwe-timedtext-loading-text-edit' => 'Laddar tidsbestämd texteditor',
	'mwe-timedtext-search' => 'Sök klipp',
	'mwe-timedtext-layout' => 'Layout',
	'mwe-timedtext-layout-ontop' => 'Ovanför video',
	'mwe-timedtext-layout-below' => 'Under video',
	'mwe-timedtext-layout-off' => 'Dölj undertexter',
	'mwe-timedtext-loading-text' => 'Laddar text ...',
	'mwe-timedtext-textcat-cc' => 'Undertexter',
	'mwe-timedtext-textcat-sub' => 'Undertexter',
	'mwe-timedtext-textcat-tad' => 'Ljudbeskrivning',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-ar' => 'Aktiva regioner',
	'mwe-timedtext-textcat-nb' => 'Anmärkning',
	'mwe-timedtext-textcat-meta' => 'Tidsbestämd metadata',
	'mwe-timedtext-textcat-trx' => 'Transkription',
	'mwe-timedtext-textcat-lrc' => 'Texter',
	'mwe-timedtext-textcat-lin' => 'Språkliga markeringar',
	'mwe-timedtext-textcat-cue' => 'Referenspunkter',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 undertexter för klipp: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Inga $1 undertexter hittades för klipp: $2',
	'mwe-timedtext-request-subs' => 'Begäran transkription',
	'mwe-timedtext-no-subs' => 'Inga textspår finns',
	'mwe-timedtext-request-subs-desc' => 'Lägga till en begäran om att denna videofil ska transkriberas',
	'mwe-timedtext-request-subs-done' => 'Transkriptionsbegäran lades till. [$1 Se alla transkribeeringsbegäranden]',
	'mwe-timedtext-request-subs-fail' => 'Det gick inte att lägga till transkriptionsbegäran. Är du inloggad?',
	'mwe-timedtext-request-already-done' => 'En transkription av denna video har redan begärts. [$1  Se alla transkriberingsbegäranden]',
);

/** Tamil (தமிழ்)
 * @author Karthi.dr
 * @author Shanmugamp7
 * @author மதனாஹரன்
 */
$messages['ta'] = array(
	'mwe-timedtext-stage-translate' => 'மொழிபெயர்க்கவும்',
	'mwe-timedtext-select-language' => 'மொழியைத் தெரி',
	'mwe-timedtext-file-language' => 'துணைத்தலைப்பு கோப்பு மொழி',
	'mwe-timedtext-back-btn' => 'பின்செல்',
	'mwe-timedtext-choose-text' => 'உரையைத் தெரி',
	'mwe-timedtext-upload-timed-text' => 'துணைத்தலைப்புக்களைச் சேர்',
	'mwe-timedtext-search' => 'துண்டைத் தேடு',
	'mwe-timedtext-layout' => 'தளவமைப்பு',
	'mwe-timedtext-layout-ontop' => 'காணொளியின் மேல்',
	'mwe-timedtext-layout-below' => 'காணொளியின் கீழ்',
	'mwe-timedtext-layout-off' => 'துணைத்தலைப்புக்களை மறை',
	'mwe-timedtext-loading-text' => 'உரையை ஏற்றுகிறது ...',
	'mwe-timedtext-textcat-sub' => 'துணைத்தலைப்புக்கள்',
	'mwe-timedtext-textcat-tad' => 'ஒலித விவரணம்',
	'mwe-timedtext-textcat-lrc' => 'பாடல் வரிகள்',
);

/** Telugu (తెలుగు)
 * @author Veeven
 */
$messages['te'] = array(
	'mwe-timedtext-stage-translate' => 'అనువదించండి',
	'mwe-timedtext-select-language' => 'భాషని ఎంచుకోండి',
	'mwe-timedtext-back-btn' => 'వెనక్కి',
	'mwe-timedtext-layout' => 'అమరిక',
	'mwe-timedtext-textcat-sub' => 'ఉపశీర్షికలు',
);

/** Tagalog (Tagalog)
 * @author AnakngAraw
 */
$messages['tl'] = array(
	'mwe-timedtext-editor' => 'Inoorasang patnugot ng teksto',
	'mwe-timedtext-stage-transcribe' => 'Ilapat upang mabasa',
	'mwe-timedtext-stage-sync' => 'Isabay',
	'mwe-timedtext-stage-translate' => 'Isalinwika',
	'mwe-timedtext-stage-upload' => 'Ikargang paitaas mula sa katutubong talaksan',
	'mwe-timedtext-select-language' => 'Piliin ang wika',
	'mwe-timedtext-file-language' => 'Wika ng talaksan ng kabahaging pamagat',
	'mwe-timedtext-back-btn' => 'Bumalik',
	'mwe-timedtext-choose-text' => 'Pumili ng teksto',
	'mwe-timedtext-upload-timed-text' => 'Magdagdag ng kabahaging mga pamagat',
	'mwe-timedtext-loading-text-edit' => 'Ikinakarga ang patnugot ng inoorasang teksto',
	'mwe-timedtext-search' => 'Maghanap ng putol',
	'mwe-timedtext-layout' => 'Kaayusan',
	'mwe-timedtext-layout-ontop' => 'Sa ibabaw ng bidyo',
	'mwe-timedtext-layout-below' => 'Sa ilalim ng bidyo',
	'mwe-timedtext-layout-off' => 'Itago ang kabahaging mga pamagat',
	'mwe-timedtext-loading-text' => 'Ikinakarga ang teksto ...',
	'mwe-timedtext-key-language' => '$1, $2',
	'mwe-timedtext-textcat-cc' => 'Mga paliwanag',
	'mwe-timedtext-textcat-sub' => 'Kabahaging mga pamagat',
	'mwe-timedtext-textcat-tad' => 'Paglalarawan ng naririnig',
	'mwe-timedtext-textcat-ktv' => 'Karaoke',
	'mwe-timedtext-textcat-tik' => 'Teksto ng pampulso',
	'mwe-timedtext-textcat-ar' => 'Masisiglang mga rehiyon',
	'mwe-timedtext-textcat-nb' => 'Paliwanag',
	'mwe-timedtext-textcat-meta' => 'Inorasang metadato',
	'mwe-timedtext-textcat-trx' => 'Sipi ng salin',
	'mwe-timedtext-textcat-lrc' => 'Titik ng awit',
	'mwe-timedtext-textcat-lin' => 'Markang-pantaas ng lingguwistika',
	'mwe-timedtext-textcat-cue' => 'Mga tuldok ng pahiwatig',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 kabahaging mga pamagat para sa putol na: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Walang natagpuang $1 kabahaging mga pamagat para sa putol na: $2',
	'mwe-timedtext-request-subs' => 'Humiling ng sipi ng salin',
	'mwe-timedtext-no-subs' => 'Walang makukuhang mga bakas ng teksto',
	'mwe-timedtext-request-subs-desc' => 'Magdagdag ng isang kahilingan para sa talaksang ito ng bidyong upang maisulat',
	'mwe-timedtext-request-subs-done' => 'Naidagdag ang kahilingan ng transkripsiyon. [$1 Tingnan ang lahat ng mga hiling ng pagpapasulat]',
	'mwe-timedtext-request-subs-fail' => 'Nabigo sa pagdaragdag ng kahilingan ng pagpapasulat. Nakalagda ka ba?',
	'mwe-timedtext-request-already-done' => 'Nahiling na ang isang transkripsiyon ng bidyong ito. [$1 Tingnan ang lahat ng mga hiling ng pagpapasulat]',
);

/** Turkish (Türkçe)
 * @author Emperyan
 */
$messages['tr'] = array(
	'mwe-timedtext-editor' => 'Zamanlanmış metin editörü',
	'mwe-timedtext-stage-transcribe' => 'Uyarla',
	'mwe-timedtext-stage-sync' => 'Eşitle',
	'mwe-timedtext-stage-translate' => 'Çevir',
	'mwe-timedtext-select-language' => 'Dil seçin',
	'mwe-timedtext-file-language' => 'Alt yazı dosya dili',
	'mwe-timedtext-back-btn' => 'Geri',
	'mwe-timedtext-choose-text' => 'Metin seç',
	'mwe-timedtext-upload-timed-text' => 'Alt yazı ekle',
	'mwe-timedtext-loading-text-edit' => 'Zamanlanmış metin editörü yükleniyor',
	'mwe-timedtext-search' => 'Klip ara',
	'mwe-timedtext-textcat-sub' => 'Alt yazılar',
	'mwe-timedtext-no-subs' => 'Parça metni yok',
);

/** Ukrainian (українська)
 * @author Base
 * @author Тест
 */
$messages['uk'] = array(
	'mwe-timedtext-editor' => 'Редактор субтитрів',
	'mwe-timedtext-stage-transcribe' => 'Стенограма',
	'mwe-timedtext-stage-sync' => 'Синхронізувати',
	'mwe-timedtext-stage-translate' => 'Перекласти',
	'mwe-timedtext-stage-upload' => 'Завантажити з локального файлу',
	'mwe-timedtext-select-language' => 'Оберіть мову',
	'mwe-timedtext-file-language' => 'Мова файлу субтитрів',
	'mwe-timedtext-back-btn' => 'Назад',
	'mwe-timedtext-choose-text' => 'Оберіть текст',
	'mwe-timedtext-upload-timed-text' => 'Додати субтитри',
	'mwe-timedtext-loading-text-edit' => 'Завантаження редактору синхронізованого тексту',
	'mwe-timedtext-search' => 'Пошук кліпу',
	'mwe-timedtext-layout' => 'Розташування',
	'mwe-timedtext-layout-ontop' => 'Угорі відео',
	'mwe-timedtext-layout-below' => 'Унизу відео',
	'mwe-timedtext-layout-off' => 'Приховати субтитри',
	'mwe-timedtext-loading-text' => 'Завантаження тексту…',
	'mwe-timedtext-textcat-cc' => 'Субтитри-підписи',
	'mwe-timedtext-textcat-sub' => 'Субтитри',
	'mwe-timedtext-textcat-tad' => 'Аудіо-опис',
	'mwe-timedtext-textcat-ktv' => 'Караоке',
	'mwe-timedtext-textcat-tik' => 'Текстові картки',
	'mwe-timedtext-textcat-ar' => 'Активні області',
	'mwe-timedtext-textcat-nb' => 'Анотація',
	'mwe-timedtext-textcat-meta' => 'Синхронізовані метадані',
	'mwe-timedtext-textcat-trx' => 'Стенограма',
	'mwe-timedtext-textcat-lrc' => 'Слова пісні',
	'mwe-timedtext-textcat-lin' => 'Лінгвістична розмітка',
	'mwe-timedtext-textcat-cue' => 'Знакові точки',
	'mwe-timedtext-language-subtitles-for-clip' => '$1 — субтитри для кліпу: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Не знайдено субтитрів $1 для кліпу: $2',
	'mwe-timedtext-request-subs' => 'Запитати транскрипцію',
	'mwe-timedtext-no-subs' => 'Немає текстових доріжок',
	'mwe-timedtext-request-subs-desc' => 'Додати запит на транскрипцію цього відео',
	'mwe-timedtext-request-subs-done' => 'Запит на транскрипцію додано. [$1 Переглянути усі запити на транскрипцію]',
	'mwe-timedtext-request-subs-fail' => 'Не вдалося додати запит на транскрипцію. Ви увійшли до системи?',
	'mwe-timedtext-request-already-done' => 'Транскрипцію цього відео уже було запитано. [$1 Переглянути усі запити на транскрипцію]',
);

/** Urdu (اردو)
 * @author පසිඳු කාවින්ද
 */
$messages['ur'] = array(
	'mwe-timedtext-stage-translate' => 'کا ترجمہ',
	'mwe-timedtext-back-btn' => 'واپس',
	'mwe-timedtext-textcat-sub' => 'رومانیہ',
);

/** Vietnamese (Tiếng Việt)
 * @author Minh Nguyen
 * @author පසිඳු කාවින්ද
 */
$messages['vi'] = array(
	'mwe-timedtext-editor' => 'Trình sửa văn bản đồng bộ',
	'mwe-timedtext-stage-transcribe' => 'Chuyển mã',
	'mwe-timedtext-stage-sync' => 'Đồng bộ',
	'mwe-timedtext-stage-translate' => 'Biên dịch',
	'mwe-timedtext-stage-upload' => 'Tải lên từ tập tin trên máy',
	'mwe-timedtext-select-language' => 'Chọn ngôn ngữ',
	'mwe-timedtext-file-language' => 'Ngôn ngữ tập tin phụ đề',
	'mwe-timedtext-back-btn' => 'Quay lại',
	'mwe-timedtext-choose-text' => 'Chọn văn bản',
	'mwe-timedtext-upload-timed-text' => 'Thêm phụ đề',
	'mwe-timedtext-loading-text-edit' => 'Đang tải trình sửa văn bản đồng bộ',
	'mwe-timedtext-layout' => 'Bố trí',
	'mwe-timedtext-layout-ontop' => 'Ở trên video',
	'mwe-timedtext-layout-below' => 'Ở dưới video',
	'mwe-timedtext-layout-off' => 'Ẩn phụ đề',
	'mwe-timedtext-loading-text' => 'Đang tải văn bản…',
	'mwe-timedtext-textcat-sub' => 'Phụ đề',
	'mwe-timedtext-textcat-tad' => 'Lời miêu tả âm thanh',
	'mwe-timedtext-textcat-ktv' => 'Karaôkê',
	'mwe-timedtext-textcat-meta' => 'Siêu dữ liệu đồng bộ',
	'mwe-timedtext-textcat-lrc' => 'Lời hát',
	'mwe-timedtext-textcat-lin' => 'Đánh dấu ngôn ngữ học',
);

/** Walloon (walon)
 * @author Srtxg
 */
$messages['wa'] = array(
	'mwe-timedtext-editor' => "Aspougneu d' tecse sincronijhî",
	'mwe-timedtext-stage-transcribe' => 'Transcrire',
	'mwe-timedtext-stage-sync' => 'Sincronijhî',
	'mwe-timedtext-stage-translate' => 'Ratourner',
	'mwe-timedtext-stage-upload' => 'Eberweter on fitchî locå',
	'mwe-timedtext-select-language' => "Tchoezixhoz l' lingaedje",
	'mwe-timedtext-file-language' => "Lingaedje do fitchî d' dizo-tites",
	'mwe-timedtext-layout-ontop' => 'Sol dizeur do videyo',
	'mwe-timedtext-layout-below' => 'Sol dizo do videyo',
	'mwe-timedtext-layout-off' => 'Catchî les dzo-tites',
	'mwe-timedtext-loading-text' => 'Dji tchedje li tecse...',
	'mwe-timedtext-textcat-cc' => 'Ledjindes',
	'mwe-timedtext-textcat-sub' => 'Dizo-tites',
	'mwe-timedtext-textcat-lrc' => 'Paroles',
	'mwe-timedtext-textcat-lin' => 'Etiketes di lingaedje',
	'mwe-timedtext-language-subtitles-for-clip' => 'Dizo-tites e $1 pol clip: $2',
	'mwe-timedtext-language-no-subtitles-for-clip' => 'Nou dzo-tite $1 di trové pol clip: $2',
);

/** Yiddish (ייִדיש)
 * @author פוילישער
 */
$messages['yi'] = array(
	'mwe-timedtext-back-btn' => 'צוריק',
	'mwe-timedtext-textcat-cc' => 'באשרייבונגען',
);

/** Simplified Chinese (中文（简体）‎)
 * @author Shizhao
 * @author Simon Shek
 * @author Wilsonmess
 * @author Xiaomingyan
 * @author Yfdyh000
 */
$messages['zh-hans'] = array(
	'mwe-timedtext-editor' => '字幕编辑器',
	'mwe-timedtext-stage-transcribe' => '笔录',
	'mwe-timedtext-stage-sync' => '同步',
	'mwe-timedtext-stage-translate' => '翻译',
	'mwe-timedtext-stage-upload' => '上传本地文件',
	'mwe-timedtext-select-language' => '选择语言',
	'mwe-timedtext-file-language' => '字幕文件语言',
	'mwe-timedtext-back-btn' => '返回',
	'mwe-timedtext-choose-text' => '选择文本',
	'mwe-timedtext-upload-timed-text' => '添加字幕',
	'mwe-timedtext-loading-text-edit' => '正在载入字幕编辑器',
	'mwe-timedtext-search' => '搜索片段',
	'mwe-timedtext-layout' => '布局',
	'mwe-timedtext-layout-ontop' => '视频上方',
	'mwe-timedtext-layout-below' => '视频下方',
	'mwe-timedtext-layout-off' => '隐藏字幕',
	'mwe-timedtext-loading-text' => '正在载入文本...',
	'mwe-timedtext-textcat-cc' => '说明',
	'mwe-timedtext-textcat-sub' => '副标题',
	'mwe-timedtext-textcat-tad' => '声音说明',
	'mwe-timedtext-textcat-ktv' => '卡拉OK',
	'mwe-timedtext-textcat-tik' => '滚动文本',
	'mwe-timedtext-textcat-ar' => '作用区域',
	'mwe-timedtext-textcat-nb' => '注释',
	'mwe-timedtext-textcat-meta' => '字幕元数据',
	'mwe-timedtext-textcat-trx' => '字幕',
	'mwe-timedtext-textcat-lrc' => '歌词',
	'mwe-timedtext-textcat-lin' => '语言标记',
	'mwe-timedtext-textcat-cue' => '提示点',
	'mwe-timedtext-language-subtitles-for-clip' => '片段$2的$1字幕',
	'mwe-timedtext-language-no-subtitles-for-clip' => '没有找到片段$2的$1字幕',
	'mwe-timedtext-request-subs' => '请求字幕',
	'mwe-timedtext-no-subs' => '没有文本轨道',
	'mwe-timedtext-request-subs-desc' => '添加该视频文件的字幕请求',
	'mwe-timedtext-request-subs-done' => '字幕请求已添加。[$1 查看所有字幕请求]',
	'mwe-timedtext-request-subs-fail' => '无法添加字幕请求。你登录了吗？',
	'mwe-timedtext-request-already-done' => '已有该视频的字幕请求。[$1 查看所有字幕请求]',
);

/** Traditional Chinese (中文（繁體）‎)
 * @author Justincheng12345
 * @author Mark85296341
 * @author Simon Shek
 */
$messages['zh-hant'] = array(
	'mwe-timedtext-editor' => '字幕編輯器',
	'mwe-timedtext-stage-transcribe' => '字幕',
	'mwe-timedtext-stage-sync' => '同步',
	'mwe-timedtext-stage-translate' => '翻譯',
	'mwe-timedtext-stage-upload' => '從本地上傳',
	'mwe-timedtext-select-language' => '選擇語言',
	'mwe-timedtext-file-language' => '字幕語言',
	'mwe-timedtext-back-btn' => '返回',
	'mwe-timedtext-choose-text' => '選擇文字',
	'mwe-timedtext-upload-timed-text' => '添加字幕',
	'mwe-timedtext-loading-text-edit' => '正在載入字幕編輯器',
	'mwe-timedtext-search' => '搜索剪輯',
	'mwe-timedtext-layout' => '布局',
	'mwe-timedtext-layout-ontop' => '於視頻上方',
	'mwe-timedtext-layout-below' => '視頻下方',
	'mwe-timedtext-layout-off' => '隱藏字幕',
	'mwe-timedtext-loading-text' => '正在讀取文本……',
	'mwe-timedtext-textcat-cc' => '標題',
	'mwe-timedtext-textcat-sub' => '副標題',
	'mwe-timedtext-textcat-tad' => '音訊說明',
	'mwe-timedtext-textcat-ktv' => '卡拉OK',
	'mwe-timedtext-textcat-tik' => '滾動文本',
	'mwe-timedtext-textcat-ar' => '有效區城',
	'mwe-timedtext-textcat-nb' => '註解',
	'mwe-timedtext-textcat-meta' => '字幕元數據',
	'mwe-timedtext-textcat-trx' => '字幕',
	'mwe-timedtext-textcat-lrc' => '歌詞',
	'mwe-timedtext-textcat-lin' => '語言標記',
	'mwe-timedtext-textcat-cue' => '暗點',
	'mwe-timedtext-language-subtitles-for-clip' => '片段的$1字幕文件：$2',
	'mwe-timedtext-language-no-subtitles-for-clip' => '沒有找到片段的$1字幕文件：$2',
	'mwe-timedtext-request-subs' => '請求字幕',
	'mwe-timedtext-no-subs' => '沒有文本軌道',
	'mwe-timedtext-request-subs-desc' => '添加此視頻的字幕請求',
	'mwe-timedtext-request-subs-done' => '已添加此視頻的字幕請求。[$1 查看所有字幕請求]',
	'mwe-timedtext-request-subs-fail' => '未能添加字幕請求。您登錄了嗎？',
	'mwe-timedtext-request-already-done' => '已請求此視頻的字幕。[$1 查看所有字幕請求]',
);
