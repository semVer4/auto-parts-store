import { Link } from 'react-router-dom'

export default function Project() {
  return (
    <div className="container workflow-page project-page editorial-content">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">О сайте</span>
          </li>
        </ul>
      </nav>
      <div className="project-hero">
        <div>
          <span className="workflow-eyebrow">АвтоДеталь / О сайте</span>
          <h1>
            Внимание — <br />
            <span>к каждой детали.</span>
          </h1>
          <p>
            Найдите запчасть по названию, производителю или артикулу, сравните характеристики и
            соберите корзину. Сохранённые заказы, их состав и история доступны в отдельном разделе.
          </p>
          <div className="workflow-actions">
            <Link className="btn btn--primary" to="/catalog">
              Открыть каталог
            </Link>
            <Link className="btn btn--secondary" to="/orders">
              Посмотреть заказы
            </Link>
          </div>
        </div>
        <div className="project-diagram" role="group" aria-label="От выбора детали до заказа">
          <p className="project-diagram__label">От выбора детали до заказа</p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Найдите нужное</strong>
                <p>Название, производитель или артикул</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Проверьте параметры</strong>
                <p>Категория, характеристики и цена</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Соберите корзину</strong>
                <p>Количество и способ получения</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>Просмотрите заказ</strong>
                <p>Состав, статус и история изменений</p>
              </div>
            </li>
          </ol>
          <p className="project-diagram__foot">
            Сохранённый заказ можно снова открыть в том же браузере.
          </p>
        </div>
      </div>
      <section className="project-section">
        <span className="workflow-eyebrow">Всё под рукой</span>
        <h2>Выбор без лишних шагов.</h2>
        <div className="project-grid">
          <article>
            <span className="project-card__number">01 / Найти</span>
            <h3>Поиск по делу</h3>
            <p>
              Введите название детали, бренд или артикул. Если точного запроса нет, начните с
              категории и просмотрите подходящие позиции каталога.
            </p>
          </article>
          <article>
            <span className="project-card__number">02 / Уточнить</span>
            <h3>Фильтры и сортировка</h3>
            <p>
              Выбирайте производителя, диапазон цены и наличие. Сортировка поможет расположить
              товары по возрастанию или убыванию стоимости.
            </p>
          </article>
          <article>
            <span className="project-card__number">03 / Собрать</span>
            <h3>Корзина под контролем</h3>
            <p>
              Изменяйте количество или удаляйте лишние позиции до оформления. Стоимость товаров
              пересчитывается автоматически, а выбранный способ получения учитывается на следующем
              шаге.
            </p>
          </article>
          <article>
            <span className="project-card__number">04 / Просмотреть</span>
            <h3>Заказы и история</h3>
            <p>
              После успешного оформления заказ сохраняется на сервере. В разделе «Заказы» можно
              посмотреть состав, итоговую сумму, текущий статус и историю его изменений.
            </p>
          </article>
        </div>
      </section>
      <section className="project-section project-demo">
        <div>
          <span className="workflow-eyebrow">Порядок действий</span>
          <h2>От детали к заказу.</h2>
          <p>
            Начните с каталога. На странице товара указаны артикул, цена и характеристики —
            проверьте их перед добавлением в корзину.
          </p>
        </div>
        <ol className="project-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Выберите доступный товар</strong>
              <p>Найдите деталь и укажите нужное количество.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Проверьте корзину</strong>
              <p>Убедитесь, что состав и количество выбраны верно.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Перейдите к оформлению</strong>
              <p>Выберите способ получения и следуйте пояснениям на странице.</p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Откройте сохранённый заказ</strong>
              <p>Номер, сумма и текущий статус доступны в разделе «Заказы».</p>
            </div>
          </li>
        </ol>
      </section>
      <section className="project-section">
        <span className="workflow-eyebrow">Полезно знать</span>
        <h2>Перед оформлением.</h2>
        <div className="project-limitations">
          <p>
            <strong>Проверяйте артикул.</strong> Сопоставляйте характеристики и применимость детали
            к вашему автомобилю. Одного похожего названия недостаточно для точного подбора.
          </p>
          <p>
            <strong>Заказы в этом браузере.</strong> Записи сохраняются на сервере, но их список
            доступен в браузере, где вы оформляли заказ. В другом браузере прежний список не
            появится.
          </p>
          <p>
            <strong>Оплата и получение.</strong> Онлайн-оплата и отправка товаров через сайт не
            выполняются. Пояснения к оформлению указаны на странице заказа.
          </p>
        </div>
      </section>
      <div className="project-bottom">
        <h2>Начните с нужной детали.</h2>
        <Link className="btn btn--primary" to="/catalog">
          Открыть каталог →
        </Link>
      </div>
    </div>
  )
}
