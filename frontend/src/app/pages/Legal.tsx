import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/design-system";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

function renderParagraph(paragraph: string) {
  const urlMatch = paragraph.match(/^(.*?)(https?:\/\/\S+)(.*)$/);
  if (!urlMatch) return paragraph;

  const [, before, url, after] = urlMatch;
  return (
    <>
      {before}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {url}
      </a>
      {after}
    </>
  );
}

function LegalPage({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <div className="page-shell min-h-screen py-10 md:py-14">
      <div className="site-container max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <Card className="mt-6 animate-fade-up">
          <Link to="/" className="font-display text-2xl font-bold text-primary hover:opacity-90">
            Nexo
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold text-neutral-900 md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Última atualização: {updatedAt}</p>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-lg font-semibold text-neutral-900">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {renderParagraph(paragraph)}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Termos de uso"
      updatedAt="agosto de 2026"
      sections={[
        {
          title: "Sobre o Nexo",
          paragraphs: [
            "O Nexo é um aplicativo de finanças pessoais criado como projeto de portfólio. O objetivo é demonstrar uma aplicação completa (frontend, API e banco de dados), e não oferecer um serviço comercial.",
            "Ao criar uma conta, você concorda em usar a plataforma de forma responsável e apenas para fins pessoais de teste ou demonstração.",
          ],
        },
        {
          title: "Conta e responsabilidade",
          paragraphs: [
            "Você é responsável por manter a confidencialidade da sua senha e pelas informações cadastradas na conta.",
            "Como se trata de um ambiente de demonstração, os dados podem ser apagados, reiniciados ou indisponibilizados a qualquer momento, sem aviso prévio.",
          ],
        },
        {
          title: "Uso adequado",
          paragraphs: [
            "Não use o Nexo para atividades ilegais, para armazenar dados sensíveis de terceiros sem autorização, nem para tentar comprometer a segurança da aplicação.",
            "Recursos como exportação para Excel e gestão de lançamentos existem para uso pessoal dentro do app.",
          ],
        },
        {
          title: "Limitação",
          paragraphs: [
            "O Nexo é fornecido “como está”, sem garantia de disponibilidade contínua, suporte oficial ou adequação a fins profissionais ou jurídicos.",
            "As informações financeiras exibidas no app não constituem aconselhamento financeiro.",
          ],
        },
        {
          title: "Propriedade intelectual",
          paragraphs: [
            "O código, o design e os materiais do Nexo pertencem ao autor do projeto e são disponibilizados sob a licença Creative Commons CC BY-NC-ND 4.0. Consulte a página de Licença para os detalhes.",
          ],
        },
      ]}
    />
  );
}

export function LicensePage() {
  return (
    <LegalPage
      title="Licença"
      updatedAt="agosto de 2026"
      sections={[
        {
          title: "CC BY-NC-ND 4.0",
          paragraphs: [
            "O Nexo é um projeto de portfólio criado por Marley Costa. Para permitir a reutilização do trabalho sem que ele seja vendido ou modificado, o material é disponibilizado sob a licença Creative Commons Atribuição – NãoComercial – SemDerivações 4.0 Internacional (CC BY-NC-ND 4.0).",
            "Em resumo: você pode compartilhar o material no formato original, com os devidos créditos, desde que o uso não seja comercial e que a obra não seja alterada.",
          ],
        },
        {
          title: "BY — Atribuição",
          paragraphs: [
            "Quem utilizar esta obra precisa dar os devidos créditos ao autor (Marley Costa) e indicar a licença, de forma razoável, sem sugerir que o autor endossa o uso.",
          ],
        },
        {
          title: "NC — NãoComercial",
          paragraphs: [
            "É proibido usar a obra para fins comerciais ou que visem vantagem financeira, venda ou exploração lucrativa do material.",
          ],
        },
        {
          title: "ND — SemDerivações",
          paragraphs: [
            "É proibido alterar, transformar, remixar ou criar obras derivadas a partir deste material. A obra só pode ser compartilhada no formato original.",
          ],
        },
        {
          title: "Texto completo",
          paragraphs: [
            "Esta página é um resumo em linguagem simples. O texto legal completo da licença está disponível em https://creativecommons.org/licenses/by-nc-nd/4.0/deed.pt_BR.",
          ],
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      updatedAt="agosto de 2026"
      sections={[
        {
          title: "Quais dados coletamos",
          paragraphs: [
            "Ao se cadastrar, o Nexo armazena nome de usuário, e-mail e a senha (de forma criptografada).",
            "Também guardamos os dados que você cadastra no app: categorias, lançamentos (valor, tipo, data e descrição) e preferências vinculadas à sua conta.",
          ],
        },
        {
          title: "Como usamos esses dados",
          paragraphs: [
            "Os dados servem apenas para autenticação, funcionamento do painel financeiro e recursos como filtros e exportação.",
            "Não vendemos dados pessoais e não usamos as informações para publicidade de terceiros.",
          ],
        },
        {
          title: "Armazenamento e acesso",
          paragraphs: [
            "Cada conta enxerga apenas os próprios dados. O acesso à API é protegido por autenticação JWT.",
            "Em ambientes de demonstração (incluindo deploy de portfólio), o banco pode ser temporário. Evite cadastrar informações reais sensíveis.",
          ],
        },
        {
          title: "Exclusão da conta",
          paragraphs: [
            "Você pode excluir a conta na área de perfil. Ao confirmar a exclusão, os dados associados à conta são removidos do sistema.",
            "Se tiver dúvidas sobre estes termos ou sobre privacidade neste projeto de portfólio, entre em contato pelo canal informado no perfil do autor no GitHub.",
          ],
        },
      ]}
    />
  );
}
