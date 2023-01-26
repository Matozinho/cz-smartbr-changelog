'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var chalk = require('chalk');

var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

var headerLength = function(answers) {
  return (
    answers.jiraCode.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
  );
};

var maxSummaryLength = function(options, answers) {
  return options.maxHeaderWidth - headerLength(answers);
};

var filterSubject = function(subject, disableSubjectLowerCase) {
  subject = subject.trim();
  if (
    !disableSubjectLowerCase &&
    subject.charAt(0).toLowerCase() !== subject.charAt(0)
  ) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function(options) {
  var types = options.types;

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function(type, key) {
    return {
      name: (key + ':').padEnd(length) + ' ' + type.description,
      value: key
    };
  });

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit) {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'input',
          name: 'jiraCode',
          message: 'Insira o código do Jira: (opcional)',
          prefix: '📝',
          transformer: function(value) {
            // Has prefix SEAL-?
            if (value.startsWith('SEAL-')) {
              return value;
            }

            // Add the SEAL- prefix
            return `SEAL-${value}`;
          }
        },
        {
          type: 'list',
          name: 'type',
          message: 'Selecione o tipo de mudança que você está enviando:',
          choices: [
            'feat: ⚙️ Nova funcionalidade',
            'bugfix: 🐛 Correção de bug',
            'hotfix: 🔥 Correção de bug crítico'
          ]
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Insira o escopo da alteração (opcional)'
        },
        {
          type: 'input',
          name: 'subject',
          message: function(answers) {
            return (
              'Insira o título do commit (máximo de ' +
              maxSummaryLength(options, answers) +
              ' caracteres):\n'
            );
          },
          default: options.defaultSubject,
          validate: function(subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            return filteredSubject.length == 0
              ? 'Título do commit é obrigatório'
              : filteredSubject.length <= maxSummaryLength(options, answers)
              ? true
              : 'Título do commit deve conter menos de ' +
                maxSummaryLength(options, answers) +
                ' caracteres. Quantidade atual de caracteres é de  ' +
                filteredSubject.length;
          },
          transformer: function(subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            var color =
              filteredSubject.length <= maxSummaryLength(options, answers)
                ? chalk.green
                : chalk.red;
            return color('(' + filteredSubject.length + ') ' + subject);
          },
          filter: function(subject) {
            return filterSubject(subject, options.disableSubjectLowerCase);
          }
        },
        {
          type: 'input',
          name: 'body',
          message: 'Insira a decrição do commit: (opcional)\n',
          default: options.defaultBody
        }
        // TODO: talvez inserir alguma validação pra fix/hotfix/breaking-changes
      ]).then(function(answers) {
        var wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        };

        const { jiraCode, scope, type, subject, body } = answers;
        const typeEmoji = type
          .split(':')[1]
          .trim()
          .split(' ')[0];

        let task = '';
        if (jiraCode) {
          task = `(#SEAL-${jiraCode})`;
        }

        // SmartBR commit pattern: (#<task|history-code>)[<scope?>]: <commit-title>
        const head = `${task}[${typeEmoji}]${
          scope ? `[${scope}]` : ''
        }: ${subject}`;

        // TODO: Buscar algum jeito de permitir quebra de linha no corpo do commit (com \ ou outro caractere)
        const wrapBody = body ? wrap(body, wrapOptions) : false;

        console.log(head);
        console.log(wrapBody);

        // commit(
        //   filter([
        //     head,
        //     wrapBody
        //     // , breaking, issues
        //   ]).join('\n\n')
        // );
      });
    }
  };
};
