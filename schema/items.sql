CREATE TABLE items (
  id INT(10) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  category_id INT(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_items_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB;

INSERT INTO items (id,category_id,name)
VALUES 
  (1,1,'Carrot'),
  (2,1,'Apple'),
  (3,1,'Orange'),
  (4,2,'Michelob ULTRA'),
  (5,2,'Coors Light'),
  (6,2,'Spotted Cow'),
  (7,3,'Donut'),
  (8,3,'Bread'),
  (9,3,'Cinnamon Roll');